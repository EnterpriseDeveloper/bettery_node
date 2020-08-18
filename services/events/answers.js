const axios = require("axios");
const path = require("../../config/path");
const contract = require("../funds/holdMoneyDetection");

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

    // add to the publicActivites table
    let publicActivites = {
        _id: "publicActivites$act1",
        from: from,
        answer: req.body.answer,
        role: partsOrValidate,
        date: Math.floor(Date.now() / 1000),
        transactionHash: req.body.transactionHash,
        currencyType: currencyType,
        eventId: eventId
    }
    setAnswer.push(publicActivites);

    // increace quntity of publicActivites in event table
    let to = partsOrValidate === "participant" ? "parcipiantsAnswer" : "validatorsAnswer";
    let quantityPath = partsOrValidate === "participant" ? "answerAmount" : 'validated'
    let event = {
        _id: eventId,
        [to]: ["publicActivites$act1"],
        [quantityPath]: partsOrValidate === "participant" ? req.body.answerAmount : validatedAmount
    }
    setAnswer.push(event)

    if (to === 'validatorsAnswer') {
        // get hold money from contract
        if (validatedAmount === 1) {
            let data = {
                "select": [{ "publicEvents/host": ["users/wallet"] }],
                "from": eventId
            }
            let userData = await axios.post(path.path + "/query", data)
            let userWallet = userData.data[0]['publicEvents/host']['users/wallet']

            await contract.receiveHoldMoney(userWallet, eventId);
        }
    }
    // add to users table
    let user = {
        _id: from,
        publicActivites: ["publicActivites$act1"],
    }
    setAnswer.push(user)

    axios.post(path.path + "/transact", setAnswer).then(() => {
        res.status(200);
        res.send({ done: "ok" });
    }).catch((err) => {
        res.status(400);
        res.send(err.response.data.message);
        console.log("DB error: " + err.response.data.message)
    })
}



module.exports = {
    setAnswer
}