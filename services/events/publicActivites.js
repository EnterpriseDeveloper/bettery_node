const axios = require("axios");
const path = require("../../config/path");
const contractInit = require("../../contract-services/contractInit");
const PublicEvents = require("../../contract-services/abi/PublicEvents.json");
const userData = require("../../helpers/userData");
const Web3 = require("web3");
const getNonce = require("../../contract-services/nonce/nonce");
const limit = require("../../config/limits");
const getGasPrice = require("../../contract-services/gasPrice/getGasPrice");
const reputationConvert = require("../../helpers/reputationConvert")

const participate = async (req, res) => {
    let web3 = new Web3();
    let setAnswer = []

    let eventId = req.body.event_id;
    let userId = Number(req.body.dataFromRedis.id)
    let amount = req.body.amount;
    let answerIndex = req.body.answerIndex;

    if (eventId == undefined ||
        userId == undefined ||
        answerIndex == undefined ||
        amount == undefined) {
        res.status(400);
        res.send("Structure is incorrect");
        return;
    }

    if (Number(amount) < limit.minBetAmount) {
        res.status(400);
        res.send("The minimum amount for betting is 0.01 BET");
        return;
    }

    try {
        let wallet = req.body.dataFromRedis.wallet;
        let pathContr = process.env.NODE_ENV;
        let contract = await contractInit.init(pathContr, PublicEvents)
        let tokens = web3.utils.toWei(String(amount), "ether");

        let gasPrice = await getGasPrice.getGasPrice();
        let gasEstimate = await contract.methods.setAnswer(
            eventId,
            answerIndex,
            tokens,
            wallet
        ).estimateGas();
        let nonce = await getNonce.getNonce();
        let transaction = await contract.methods.setAnswer(
            eventId,
            answerIndex,
            tokens,
            wallet
        ).send({
            gas: Number((((gasEstimate * 50) / 100) + gasEstimate).toFixed(0)),
            gasPrice: gasPrice,
            nonce: nonce
        });


        if (transaction) {

            // TODO add to the history of money transaction

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
        console.log(err.message);
        res.status(400);
        res.send(err.message);
    }
}

const validate = async (req, res) => {
    let setAnswer = []

    let eventId = Number(req.body.event_id);
    let from = Number(req.body.dataFromRedis.id)

    let answer = Number(req.body.answer);
    if (eventId == undefined ||
        answer == undefined ||
        from == undefined) {
        res.status(400);
        res.send("Structure is incorrect");
        return;
    }

    try {
        let reputation = await userData.getUserReput(from, res)
        let wallet = req.body.dataFromRedis.wallet;
        let pathContr = process.env.NODE_ENV;
        let contract = await contractInit.init(pathContr, PublicEvents)

        let gasPrice = await getGasPrice.getGasPrice();
        let gasEstimate = await contract.methods.setValidator(
            eventId,
            answer,
            wallet,
            reputation
        ).estimateGas();
        let nonce = await getNonce.getNonce();
        let transaction = await contract.methods.setValidator(
            eventId,
            answer,
            wallet,
            reputation
        ).send({
            gas: Number((((gasEstimate * 50) / 100) + gasEstimate).toFixed(0)),
            gasPrice: gasPrice,
            nonce: nonce
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
                amount: 0,
                expertReput: reputation
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
        console.log(err.message);
        res.status(400);
        res.send(err.message);
    }
}


module.exports = {
    participate,
    validate
}
