const axios = require("axios");
const path = require("../config/path");
const contract = require("./holdMoneyDetection");
const demoContract = require("./demoCoinContract");

const setAnswer = (req, res) => {

    if (req.body.multy) {
        res.status(400);
        res.send("multy answer not work");
    } else {
        setOneAnswer(req, res)
    }
}

const setOneAnswer = async (req, res) => {
    let setAnswer = []

    let eventId = req.body.event_id;
    let from = Number(req.body.userId)
    let currencyType = req.body.currencyType
    let validatedAmount = Number(req.body.validated);
    let partsOrValidate = req.body.from;

    // add to the activites table
    let activites = {
        _id: "activites$act1",
        from: from,
        answer: req.body.answer,
        role: partsOrValidate,
        date: Math.floor(Date.now() / 1000),
        transactionHash: req.body.transactionHash,
        currencyType: currencyType,
        eventId: eventId
    }
    setAnswer.push(activites);

    // increace quntity of activites in event table
    let to = partsOrValidate === "participant" ? "parcipiantsAnswer" : "validatorsAnswer";
    let quantityPath = partsOrValidate === "participant" ? "answerAmount" : 'validated'
    let event = {
        _id: eventId,
        [to]: ["activites$act1"],
        [quantityPath]: partsOrValidate === "participant" ? req.body.answerAmount : validatedAmount
    }
    setAnswer.push(event)

    if (to === 'validatorsAnswer') {
        // get hold money from contract
        if (validatedAmount === 1 && currencyType !== "demo") {
            let data = {
                "select": [{ "events/host": ["users/loomWallet"] }],
                "from": eventId
            }
            let userData = await axios.post(path.path + "/query", data)
            let loomWallet = userData.data[0]['events/host']['users/loomWallet']

            await contract.receiveHoldMoney(loomWallet, eventId);
        }
        // check last validator for demo coins
        if (currencyType === "demo") {
            let data = {
                "select": ["*",
                    { "events/host": ["_id", "users/fakeCoins"] },
                    { "events/parcipiantsAnswer": ["*", { "activites/from": ["_id", "users/fakeCoins"] }] },
                    { "events/validatorsAnswer": ["*", { "activites/from": ["_id", "users/fakeCoins"] }] }],
                "from": eventId
            }
            let eventData = await axios.post(path.path + "/query", data);
            let validEventAmount = eventData.data[0]["events/validatorsAmount"]
            if (validEventAmount === validatedAmount) {
                demoContract.demoSmartContract(eventData);
            }

        }
    }

    // get user demo coins
    if (currencyType === "demo" && partsOrValidate === 'participant') {

        let { transactId, userAmount, history } = await histortTransactForDemoCoins(from, eventId)

        let user = {
            _id: from,
            activites: ["activites$act1"],
            fakeCoins: userAmount,
            historyTransactions: [transactId]
        }
        setAnswer.push(user);
        setAnswer.push(history);

    } else {
        // add to users table
        let user = {
            _id: from,
            activites: ["activites$act1"],
        }
        setAnswer.push(user)
    }

    axios.post(path.path + "/transact", setAnswer).then(() => {
        res.status(200);
        res.send({ done: "ok" });
    }).catch((err) => {
        res.status(400);
        res.send(err.response.data.message);
        console.log("DB error: " + err.response.data.message)
    })
}

const histortTransactForDemoCoins = async (from, eventId) => {
    let data = {
        "select": ["*"],
        "from": [from, eventId]
    }
    let allData = await axios.post(path.path + "/query", data);

    let demoCoins = allData.data[0]["users/fakeCoins"];
    let eventMoney = allData.data[1]["events/money"];
    let userAmount = demoCoins - eventMoney
    console.log()

    let transactId = "historyTransactions$quizHoldMoney"
    let history = {
        _id: transactId,
        eventId: Number(eventId),
        role: "participant",
        amount: Number(eventMoney),
        paymentWay: "send",
        currencyType: "demo",
        date: Math.floor(Date.now() / 1000)
    }
    return { transactId, userAmount, history}
}



module.exports = {
    setAnswer
}