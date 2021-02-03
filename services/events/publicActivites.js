const axios = require("axios");
const path = require("../../config/path");
const contract = require("../funds/holdMoneyDetection");
const refund = require('../../bot/refundBot');

const participate = async (req, res) => {
    let setAnswer = []

    let eventId = req.body.event_id;
    let userId = Number(req.body.userId)
    let currencyType = req.body.currencyType
    let amount = req.body.amount;

    if (eventId == undefined ||
        userId == undefined ||
        currencyType == undefined ||
        amount == undefined) {
        res.status(400);
        res.send({ message: "Structure is incorrect" });
        return;
    }

    // add to the publicActivites table
    let publicActivites = {
        _id: "publicActivites$act",
        from: userId,
        answer: req.body.answer,
        role: "participant",
        date: Math.floor(Date.now() / 1000),
        transactionHash: req.body.transactionHash,
        currencyType: currencyType,
        eventId: eventId,
        amount: amount
    }
    setAnswer.push(publicActivites);

    // increace quntity of publicActivites in event table
    let event = {
        _id: eventId,
        "parcipiantsAnswer": ["publicActivites$act"],
    }
    setAnswer.push(event)

    // add to users table
    let user = {
        _id: userId,
        publicActivites: ["publicActivites$act"],
    }
    setAnswer.push(user)

    await axios.post(`${path.path}/transact`, setAnswer).catch((err) => {
        res.status(400);
        res.send(err.response.data.message);
        console.log("DB error: " + err.response.data.message)
        return;
    })

    res.status(200);
    res.send({ done: "ok" });
}

const validate = async (req, res) => {
    let setAnswer = []

    let eventId = Number(req.body.event_id);
    let from = Number(req.body.userId)
    let currencyType = req.body.currencyType
    let validated = Number(req.body.validated);
    if (eventId == undefined ||
        from == undefined ||
        currencyType == undefined ||
        validated == undefined) {
        res.status(400);
        res.send({ message: "Structure is incorrect" });
        return;
    }

    // add to the publicActivites table
    let publicActivites = {
        _id: "publicActivites$act1",
        from: from,
        answer: req.body.answer,
        role: "validator",
        date: Math.floor(Date.now() / 1000),
        transactionHash: req.body.transactionHash,
        currencyType: currencyType,
        eventId: eventId,
        amount: 0
    }
    setAnswer.push(publicActivites);

    // increace quntity of publicActivites in event table
    let event = {
        _id: eventId,
        "validatorsAnswer": ["publicActivites$act1"],
    }
    setAnswer.push(event)

    if (validated === 1) {

        // detect amount of validators
        setAmountOfValidators(eventId);

        // TODO ON HOLD
        //         let data = {
        //             "select": [{ "publicEvents/host": ["users/wallet"] }],
        //             "from": eventId
        //         }
        //         let userData = await axios.post(path.path + "/query", data)
        //         let userWallet = userData.data[0]['publicEvents/host']['users/wallet']

        //         await contract.receiveHoldMoney(userWallet, eventId);
    }

    // add to users table
    let user = {
        _id: from,
        publicActivites: ["publicActivites$act1"],
    }
    setAnswer.push(user)

    await axios.post(`${path.path}/transact`, setAnswer).catch((err) => {
        res.status(400);
        res.send(err.response.data.message);
        console.log("DB error: " + err.response.data.message)
        return;
    })

    res.status(200);
    res.send({ done: "ok" });
}

const setAmountOfValidators = async (id) => {
    let config = {
        "select": ["*",
            { 'publicEvents/parcipiantsAnswer': ["*"] }
        ],
        "from": id
    }

    let data = await axios.post(`${path.path}/query`, config).catch((err) => {
        console.log("DB error: " + err.response.data.message)
        return;
    })

    // validatorsAmount
    let events = data.data[0];
    let participant = events["publicEvents/parcipiantsAnswer"]
    if (participant === undefined) {
        await refund.revertEvent(id, participant);
    } else {
        if (events['publicEvents/validatorsAmount'] == 0) {
            let partAmount = (10 * participant.length) / 100;
            let validAmount = partAmount <= 3 ? 3 : partAmount;

            let send = [{
                "_id": id,
                "validatorsAmount": validAmount
            }]
            await axios.post(`${path.path}/transact`, send).catch((err) => {
                console.log("DB error: " + err.response.data.message)
                return;
            })
        }
    }
}



module.exports = {
    participate,
    validate
}