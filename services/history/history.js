const Web3 = require('web3');
const axios = require("axios");
const path = require("../../config/path");
const _ = require("lodash");
const configContract = require("../../config/demoContractConfig")


const setReceiveHistory = async (contractData, eventId, ether) => {

    let persentValidator = configContract.persentValidator;
    let allHistory = []

    let findActivites = {
        "select": ["*",
            { "activites/from": ["users/wallet", "users/fakeCoins"] },
            { "activites/eventId": ["events/money"] }
        ],
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
            userId: o['activites/from']["_id"],
            currencyType: o["activites/currencyType"],
            fakeCoins: o['activites/from']["users/fakeCoins"]
        }
    })

    // filter by correct answer
    let rightAnswer = _.filter(allData, function (o) { return o.answer === Number(contractData.correctAnswer); });

    let findPartWithDemoCoins = _.filter(allData, function (o) { return o.currencyType === "demo" && o.role === "participant" });
    // find validators
    let findValid = _.filter(rightAnswer, function (o) { return o.role === 'validator' });
    if (findPartWithDemoCoins.length !== 0) {
        // pay if demo coins exist
        let eventPrice = activites.data[0]["activites/eventId"]["events/money"];
        let demoMoney = findPartWithDemoCoins.length * eventPrice;

        let findPercentForValidators = percentCalculate(demoMoney, persentValidator);
        demoMoney = demoMoney - findPercentForValidators;
        let forEachValidator = findPercentForValidators / findValid.length;
        for (let i = 0; i < findValid.length; i++) {

            // add histoty transaction
            let { demoCoinsHistory, etherHistory, historyID, etherHistoryID } = historyTransact(
                "historyTransactions$valid" + i,
                eventId,
                "validator",
                forEachValidator,
                contractData.persentForEachValidators,
                ether
            )

            allHistory.push(demoCoinsHistory)
            allHistory.push(etherHistory)

            allHistory.push({
                "_id": findValid[i].userId,
                fakeCoins: Number(findValid[i].fakeCoins) + forEachValidator,
                historyTransactions: [historyID, etherHistoryID]
            })
        }

        // pay demo coins for participant
        let findCorrectParticipant = _.filter(rightAnswer, function (o) { return o.currencyType === "demo" && o.role === 'participant' });
        if (findCorrectParticipant.length !== 0) {
            let forEachParticipant = demoMoney / findCorrectParticipant.length;
            for (let i = 0; i < findCorrectParticipant.length; i++) {

                // add histoty transaction
                let { history, historyID } = historyTransactForPartsDemoCoins("historyTransactions$parts" + i, eventId, "participant", forEachParticipant)
                allHistory.push(history)

                allHistory.push({
                    "_id": findCorrectParticipant[i].userId,
                    fakeCoins: findCorrectParticipant[i].fakeCoins + forEachParticipant,
                    historyTransactions: [historyID]
                })
            }
        }
    } else {
        // pay if demo coins don't exist
        let valid = createHistory(eventId, findValid, contractData.persentForEachValidators, "validator", ether);
        let userData = createUserHistory(findValid, valid)
        let addTogether = valid.concat(userData);

        addTogether.forEach((z) => {
            allHistory.push(z)
        })
    }

    // find participant
    let findPart = _.filter(rightAnswer, function (o) { return o.currencyType !== "demo" && o.role === 'participant' });
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

function historyTransactForPartsDemoCoins(historyID, eventId, role, eventMoney) {
    let history = {
        _id: historyID,
        eventId: Number(eventId),
        role: role,
        amount: Number(eventMoney),
        paymentWay: "receive",
        currencyType: "demo",
        date: Math.floor(Date.now() / 1000)
    }

    return { history, historyID }
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
        currencyType: ether ? "ether" : "token"
    }, {
        _id: host,
        "historyTransactions": ["historyTransactions$newHost"]
    }]

    axios.post(path.path + "/transact", allData).catch((err) => {
        console.log("DB error: " + err.response.data.message)
    })
}

const percentCalculate = (amount, percent) => {
    return Number(((amount * percent) / 100).toFixed(4));
}

const historyTransact = (historyID, eventId, role, eventMoney, etherMoney, etherWay) => {
    let etherHistoryID = historyID + "ether";

    let web3 = new Web3();
    let etherMoneyfromWei = web3.utils.fromWei(String(etherMoney), 'ether')

    let etherHistory = {
        _id: etherHistoryID,
        eventId: Number(eventId),
        role: role,
        amount: Number(etherMoneyfromWei),
        paymentWay: "receive",
        currencyType: etherWay ? "ether" : "token",
        date: Math.floor(Date.now() / 1000)
    };

    let demoCoinsHistory = {
        _id: historyID,
        eventId: Number(eventId),
        role: role,
        amount: Number(eventMoney),
        paymentWay: "receive",
        currencyType: "demo",
        date: Math.floor(Date.now() / 1000)
    };

    return { demoCoinsHistory, etherHistory, historyID, etherHistoryID }
}

module.exports = {
    setReceiveHistory
}