const Web3 = require('web3');
const axios = require("axios");
const path = require("../config/path");
const _ = require("lodash");


const setReceiveHistory = async (contractData, eventId, ether) => {

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


    let allData = activites.data.map((o) => {
        return {
            id: o._id,
            role: o['activites/role'],
            answer: o['activites/answer'],
            wallet: o['activites/from']["users/wallet"],
            userId: o['activites/from']["_id"]
        }
    })

    // filter by correct answer
    let rightAnswer = _.filter(allData, function (o) { return o.answer === Number(contractData.correctAnswer); });

    // find participant

    let findPart = _.filter(rightAnswer, function (o) { return o.role === 'participant' });
    if (findPart.length !== 0) {
        let parc = createHistory(eventId, findPart, contractData.moneyForParticipant, "participant", ether);
        let userData = createUserHistory(findPart, parc)
        let addTogether = parc.concat(userData);

        addTogether.forEach((z) => {
            allHistory.push(z)
        })

    }
    // find validators

    let findValid = _.filter(rightAnswer, function (o) { return o.role === 'validator' });
    if (findValid.length !== 0) {
        let valid = createHistory(eventId, findValid, contractData.persentForEachValidators, "validator", ether);
        let userData = createUserHistory(findValid, valid)
        let addTogether = valid.concat(userData);

        addTogether.forEach((z) => {
            allHistory.push(z)
        })
    }

    axios.post(path.path + "/transact", allHistory).then(() => {
        setToHost(eventId, contractData.persentFeeHost, ether)
    }).catch((err) => {
        console.log("DB error: " + err.response.data.message)
    })
}

function createHistory(eventId, data, amount, role, ether) {
    let web3 = new Web3();
    let money = web3.utils.fromWei(String(amount), 'ether')

    return data.map((x, i) => {
        return {
            _id: "historyTransactions$" + role + i,
            date: Math.floor(Date.now() / 1000),
            paymentWay: "receive",
            amount: Number(money),
            eventId: Number(eventId),
            role: role,
            ether: ether
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

async function setToHost(eventId, amount, ether) {
    let getQuestion = {
        "select": [{ "events/host": ["users/wallet"] }],
        "from": Number(eventId)
    }

    let quest = await axios.post(path.path + "/query", getQuestion)
        .catch((err) => {
            console.log("DB error: " + err.response.data.message)
        })

    let host = quest.data[0]['events/host']['_id']

    let web3 = new Web3();
    let money = web3.utils.fromWei(String(amount), 'ether')

    let allData = [{
        _id: "historyTransactions$newHost",
        date: Math.floor(Date.now() / 1000),
        paymentWay: "receive",
        amount: Number(money),
        eventId: Number(eventId),
        role: "host",
        ether: ether
    }, {
        _id: host,
        "historyTransactions": ["historyTransactions$newHost"]
    }]

    axios.post(path.path + "/transact", allData).catch((err) => {
        console.log("DB error: " + err.response.data.message)
    })

}

module.exports = {
    setReceiveHistory
}