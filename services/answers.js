const axios = require("axios");
const path = require("../config/path");
const contract = require("./holdMoneyDetection");

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

    // add to the activites table
    let activites = {
        _id: "activites$act1",
        from: from,
        answer: req.body.answer,
        role: req.body.from,
        date: Math.floor(Date.now() / 1000),
        transactionHash: req.body.transactionHash,
        eventId: eventId
    }
    setAnswer.push(activites);

    // increace quntity of activites in event table
    let to = req.body.from === "participant" ? "parcipiantsAnswer" : "validatorsAnswer";
    let quantityPath = req.body.from === "participant" ? "answerAmount" : 'validated'
    let event = {
        _id: eventId,
        [to]: ["activites$act1"],
        [quantityPath]: req.body.from === "participant" ? req.body.answerAmount : req.body.validated
    }
    setAnswer.push(event)

    // get hold money from contract
    if (to === 'validatorsAnswer') {
        if (Number(req.body.validated) === 1) {
            let data = {
                "select": [{ "events/host": ["users/loomWallet"] }],
                "from": eventId
            }
            let userData = await axios.post(path.path + "/query", data)
            let loomWallet = userData.data['events/host']['users/loomWallet']

            await contract.receiveHoldMoney(loomWallet, eventId);
        }
    }

    // add to users table
        let user = {
            _id: from,
            activites: ["activites$act1"],
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