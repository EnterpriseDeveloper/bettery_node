const Contract = require("../contract/contract");
const axios = require("axios");
const path = require("../config/path");
const Web3 = require('web3');

const receiveHoldMoney = async (loomWallet, eventId) => {
    let contr = new Contract.Contract();
    let getContract = await contr.loadContract();

    let getMoneyById = await getContract.methods.getHoldMoneyById().call();
    console.log(getMoneyById);
    if (getMoneyById !== undefined) {

        let web3 = new Web3();
        let coins = web3.utils.fromWei(getMoneyById, 'ether');

        console.log(loomWallet)

        let contractData = await getContract.methods.getMoneyRetention(loomWallet.toString()).send();
        if (contractData !== undefined) {

            let getUserId = {
                "from": Number(eventId),
                "select": [{ "events/host": ["users/_id"] }]
            }

            let userData = await axios.post(path.path + "/query", getUserId)
                .catch((err) => {
                    console.log("DB error: " + err.response.data.message)
                })

            if (userData.data !== undefined) {
                let userId = userData.data['events/host']['_id'];

                let history = [{
                    _id: "historyTransactions$quizHoldMoney",
                    eventId: Number(eventId),
                    role: "quiz hold money",
                    amount: Number(coins),
                    paymentWay: "receive",
                    date: Math.floor(Date.now() / 1000)
                }, {
                    _id: userId,
                    historyTransactions: ["historyTransactions$quizHoldMoney"]
                }]

                console.log(history);
                return history;

            } else {
                console.log("db error");
                return "error";
            }
        } else {
            console.log("smart contract error");
            return "error";
        }
    } else {
        console.log("smart contract error");
        return "error";
    }
}

module.exports = {
    receiveHoldMoney
}