const axios = require("axios");
const path = require("../../config/path");
const Web3 = require('web3');

const setHistoryMoney = async (contractData) => {
    // TODO rewrite history for public events
    let web3 = new Web3();
    let userWallet = contractData.wallet;
    let eventId = Number(contractData.question_id);
    let amount = Number(web3.utils.fromWei(contractData.money, "ether"));
    let paymentWay = contractData.path;
    let payEther = contractData.payEther;
    let role = contractData.from

    let data = {
        "select": ["*"],
        "from": ["users/wallet", userWallet]
    }

    let userData = await axios.post(path.path + "/query", data)
        .catch((err) => {
            console.log("DB error: " + err.response.data.message)
        })

    if (userData.data.length !== undefined) {
        let userId = userData.data[0]["_id"];

        let history = [{
            _id: "historyTransactions$quizHoldMoney",
            eventId: Number(eventId),
            role: role,
            amount: Number(amount),
            paymentWay: paymentWay,
            currencyType: payEther ? "ether" : "token",
            date: Math.floor(Date.now() / 1000)
        }, {
            _id: userId,
            historyTransactions: ["historyTransactions$quizHoldMoney"]
        }]

        await axios.post(path.path + "/transact", history)
            .catch((err) => {
                console.log("DB error: " + err.response.data.message)
            })
    } else {
        console.log("setHistoryHold error");
    }

}



module.exports = {
    setHistoryMoney
}