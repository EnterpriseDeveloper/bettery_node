const Web3 = require('web3');
const axios = require("axios");
const path = require("../config/path");
const _ = require("lodash");


const setReceiveHistory = async (contractData, eventId) => {

    let allHistory = []

    let findActivites = {
        "select": [{ "activites/from": ["users/wallet"] }, "activites/role", "activites/answer"],
        "where": "activites/eventId = " + eventId,
        "from": "activites"
    }

    let activites = await axios.post(path.path + "/query", findActivites)
        .catch((err) => {
            console.log("DB error: " + err.response.data.message)
        })

        console.log(activites.data)

    let allData = activites.data.map((o) => {
        return {
            id: o._id,
            role: o['activites/role'],
            answer: o['activites/answer'],
            wallet: o['activites/from']["users/wallet"],
            userId: o['activites/from']["_id"]
        }
    })

    console.log(allData)

    // filter by correct answer
    let rightAnswer = _.filter(allData, function (o) { return o.answer === Number(contractData.correctAnswer); });

    // find participant

    let findPart = _.filter(rightAnswer, function (o) { return o.role === 'participant' });
    if (findPart.length !== 0) {
        let parc = createHistory(eventId, findPart, contractData.monayForParticipant, "participant");
        let userData = createUserHistory(findPart, parc)
        let addTogether = parc.concat(userData);

        addTogether.forEach((z) => {
            allHistory.push(z)
        })

    }
    // find validators

    let findValid = _.filter(rightAnswer, function (o) { return o.role === 'validator' });
    if(findValid.length !== 0){
        let valid = createHistory(eventId, findValid, contractData.persentForEachValidators, "validator");
        let userData = createUserHistory(findValid, valid)
        let addTogether = valid.concat(userData);

        addTogether.forEach((z) => {
            allHistory.push(z)
        })
    }

    console.log(allHistory);

    axios.post(path.path + "/transact", allHistory).then(()=>{
        setToHost(eventId, contractData.persentFeeHost)
    }).catch((err)=>{
        console.log("DB error: " + err.response.data.message)
    })
}

function createHistory(eventId, data, amount, role) {
    let web3 = new Web3();
    let money = web3.utils.fromWei(String(amount), 'ether')

    return data.map((x, i) => {
        return {
            _id: "historyTransactions$" + role + i,
            date: Math.floor(Date.now() / 1000),
            paymentWay: "receive",
            amount: Number(money),
            eventId: Number(eventId),
            role: role
        }
    })
}

function createUserHistory(userData, historyData) {
    return userData.map((x, i) => {
        return {
            _id: x.userId,
            "historyTransactions": [historyData[i]._id]
        }
    })
}

async function setToHost(eventId, amount) {
    let getQuestion = {
        "select": [{ "events/host": ["users/wallet"] }],
        "from": Number(eventId)
    }

    let quest = await axios.post(path.path + "/query", getQuestion)
        .catch((err) => {
            console.log("DB error: " + err.response.data.message)
        })

    let host = quest.data['events/host']['_id']

    let web3 = new Web3();
    let money = web3.utils.fromWei(String(amount), 'ether')

    let allData = [{
        _id: "historyTransactions$newHost",
        date: Math.floor(Date.now() / 1000),
        paymentWay: "receive",
        amount: Number(money),
        eventId: Number(eventId),
        role: "host"
    },{
        _id: host,
        "historyTransactions": ["historyTransactions$newHost"]
    }]

    axios.post(path.path + "/transact", allData).then(()=>{
        console.log("finish")
    }).catch((err)=>{
        console.log("DB error: " + err.response.data.message)
    })
    
}

module.exports = {
    setReceiveHistory
}