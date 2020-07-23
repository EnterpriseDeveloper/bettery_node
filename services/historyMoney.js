const axios = require("axios");
const path = require("../config/path");
const Web3 = require('web3');

const setHistoryMoney = async (contractData) => {
    let web3 = new Web3();
    let userWallet = contractData.wallet.toLowerCase();
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

const setRevertedHistoryMoney = async (contractData) =>{
    let eventId = Number(contractData.question_id);
    let data = {
        "select": ["*", {"events/parcipiantsAnswer": [{"activites/from":["_id"]}]}],
        "from": eventId
    }

    let eventData = await axios.post(path.path + "/query", data).catch((err)=>{
        console.log("db err: " + err)
    })

    if(eventData.data.length !== 0){

        let money = Number(eventData.data[0]["events/money"]);
        let currencyType = eventData.data[0]["events/currencyType"];

        let historyData = eventData.data[0]["events/parcipiantsAnswer"].map((x, i)=>{
            return {
                _id: x["activites/from"]["_id"],
                historyTransactions: ["historyTransactions$quizHoldMoney" + i],
            }
        })

        historyData.forEach((x)=>{
           historyData.push(
            {
                _id: x.historyTransactions[0],
                eventId: eventId,
                role: "Revert",
                amount: money,
                paymentWay: "receive",
                currencyType: currencyType,
                date: Math.floor(Date.now() / 1000)
            }
           )
        })

        // add reverted to the event
        historyData.push({
            _id: eventId,
            reverted: true
        })


        await axios.post(path.path + "/transact", historyData)
        .catch((err) => {
            console.log("DB error: " + err.response.data.message)
        })


    }else{
        console.log("setRevertedHistoryMoney error");
    }
    
}



module.exports = {
    setHistoryMoney,
    setRevertedHistoryMoney
}