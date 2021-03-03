const axios = require("axios");
const path = require("../../config/path");
const contractInit = require("../../contract-services/contractInit");
const PublicEvents = require("../../contract-services/abi/PublicEvents.json");
const userData = require("../../helpers/userData");

const participate = async (req, res) => {
    let setAnswer = []

    let eventId = req.body.event_id;
    let userId = Number(req.body.userId)
    let amount = req.body.amount;
    let answerIndex = req.body.answerIndex;

    if (eventId == undefined ||
        userId == undefined ||
        answerIndex == undefined ||
        amount == undefined) {
        res.status(400);
        res.send({ message: "Structure is incorrect" });
        return;
    }

    try {
        let playerWallet = await userData.getUserWallet(userId, res)
        let contract = await contractInit.init(process.env.NODE_ENV, PublicEvents)

        let gasEstimate = await contract.methods.setAnswer(
            eventId,
            answerIndex,
            amount,
            playerWallet,
            userId,
            0 // TODO add referals deep
        ).estimateGas();
        let transaction = await contract.methods.setAnswer(
            eventId,
            answerIndex,
            amount,
            playerWallet,
            userId,
            0 // TODO add referals deep
        ).send({
            gas: gasEstimate,
            gasPrice: 0
        });


        if (transaction) {
            // add to the publicActivites table
            let publicActivites = {
                _id: "publicActivites$act",
                from: userId,
                answer: answerIndex,
                role: "participant",
                date: Math.floor(Date.now() / 1000),
                transactionHash: transaction.transactionHash,
                //    currencyType: currencyType,  TODO remove from DB Shema
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

    } catch (err) {
        console.log(err);
        res.status(400);
        res.send(err);
    }
}

const validate = async (req, res) => {
    let setAnswer = []

    let eventId = Number(req.body.event_id);
    let from = Number(req.body.userId)
    let answer = Number(req.body.answer);
    if (eventId == undefined ||
        answer == undefined ||
        from == undefined) {
        res.status(400);
        res.send({ message: "Structure is incorrect" });
        return;
    }

    try {
        let expertWallet = await userData.getUserWallet(userId, res)
        let contract = await contractInit.init(process.env.NODE_ENV, PublicEvents)

        let gasEstimate = await contract.methods.setValidator(
            eventId,
            answerIndex,
            expertWallet,
            0 // TODO add reputation
        ).estimateGas();
        let transaction = await contract.methods.setValidator(
            eventId,
            answerIndex,
            expertWallet,
            0 // TODO add reputation
        ).send({
            gas: gasEstimate,
            gasPrice: 0
        });
        if (transaction) {
            // add to the publicActivites table
            let publicActivites = {
                _id: "publicActivites$act1",
                from: from,
                answer: answer,
                role: "validator",
                date: Math.floor(Date.now() / 1000),
                transactionHash: transaction.transactionHash,
             // currencyType: currencyType, TODO remove from DB Shema
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
    } catch (err) {
        console.log(err);
        res.status(400);
        res.send(err);
    }
}


module.exports = {
    participate,
    validate
}