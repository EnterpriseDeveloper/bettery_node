const Web3 = require('web3');
const axios = require("axios");
const path = require("../../config/path");
const _ = require("lodash");


const setReceiveHistory = async (contractData, eventId, ether) => {

    let allHistory = []

    let findActivites = {
        "select": ["*",
            { "publicActivites/from": ["users/wallet", "users/fakeCoins"] },
            { "publicActivites/eventId": ["publicEvents/money"] }
        ],
        "where": "publicActivites/eventId = " + eventId,
        "from": "publicActivites"
    }

    let publicActivites = await axios.post(path.path + "/query", findActivites)
        .catch((err) => {
            console.log("DB error: " + err.response.data.message)
        })


    let allData = publicActivites.data.map((o) => {
        return {
            id: o._id,
            role: o['publicActivites/role'],
            answer: o['publicActivites/answer'],
            wallet: o['publicActivites/from']["users/wallet"],
            userId: o['publicActivites/from']["_id"],
            currencyType: o["publicActivites/currencyType"],
            fakeCoins: o['publicActivites/from']["users/fakeCoins"]
        }
    })

    // filter by correct answer
    let rightAnswer = _.filter(allData, function (o) { return o.answer === Number(contractData.correctAnswer); });

    // find validators
    let findValid = _.filter(rightAnswer, function (o) { return o.role === 'validator' });

    let valid = createHistory(eventId, findValid, contractData.persentForEachValidators, "validator", ether);
    let userData = createUserHistory(findValid, valid)
    let addTogether = valid.concat(userData);

    addTogether.forEach((z) => {
        allHistory.push(z)
    })

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
            currencyType: ether ? "ether" : "token"
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
        "select": [{ "publicEvents/host": ["users/wallet"] }],
        "from": Number(eventId)
    }

    let quest = await axios.post(path.path + "/query", getQuestion)
        .catch((err) => {
            console.log("DB error: " + err.response.data.message)
        })

    let host = quest.data[0]['publicEvents/host']['_id']

    let web3 = new Web3();
    let money = web3.utils.fromWei(String(amount), 'ether')

    let allData = [{
        _id: "historyTransactions$newHost",
        date: Math.floor(Date.now() / 1000),
        paymentWay: "receive",
        amount: Number(money),
        eventId: Number(eventId),
        role: "host",
        currencyType: ether ? "ether" : "token"
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