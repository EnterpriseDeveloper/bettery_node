import axios from "axios";
import { path } from "../../config/path";
import { init } from "../../contract-services/contractInit";
import PublicEvents from "../../contract-services/abi/PublicEvents.json";
import { getUserReput } from "../../helpers/userData";
import Web3 from "web3";
import { getNonce } from "../../contract-services/nonce/nonce";
import { minBetAmount } from "../../config/limits";
import { getGasPrice, estimateGasLimit } from "../../contract-services/gasPrice/getGasPrice";

const participate = async (req: any, res: any) => {
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

    if (Number(amount) < minBetAmount) {
        res.status(400);
        res.send("The minimum amount for betting is 0.01 BET");
        return;
    }

    try {
        let wallet = req.body.dataFromRedis.wallet;
        let pathContr = process.env.NODE_ENV;
        let contract = await init(pathContr, PublicEvents)
        let tokens = web3.utils.toWei(String(amount), "ether");

        let gasEstimate = await contract.methods.setAnswer(
            eventId,
            answerIndex,
            tokens,
            wallet
        ).estimateGas();
        let transaction = await contract.methods.setAnswer(
            eventId,
            answerIndex,
            tokens,
            wallet
        ).send({
            gas: await estimateGasLimit(gasEstimate),
            gasPrice: await getGasPrice(),
            nonce: await getNonce()
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

            await axios.post(`${path}/transact`, setAnswer).catch((err) => {
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

const validate = async (req: any, res: any) => {
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
        let reputation = await getUserReput(from, res)
        let wallet = req.body.dataFromRedis.wallet;
        let pathContr = process.env.NODE_ENV;
        let contract = await init(pathContr, PublicEvents)

        let gasEstimate = await contract.methods.setValidator(
            eventId,
            answer,
            wallet,
            reputation
        ).estimateGas();
        let transaction = await contract.methods.setValidator(
            eventId,
            answer,
            wallet,
            reputation
        ).send({
            gas: await estimateGasLimit(gasEstimate),
            gasPrice: await getGasPrice(),
            nonce: await getNonce()
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

            await axios.post(`${path}/transact`, setAnswer).catch((err) => {
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


export {
    participate,
    validate
}
