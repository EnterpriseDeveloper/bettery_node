import axios from "axios";
import { path } from "../../config/path";
import { minBetAmount } from "../../config/limits";

const participate = async (req: any, res: any) => {
    let setAnswer = []

    let eventId = req.body.event_id;
    let userId = Number(req.body.dataFromRedis.id)
    let amount = req.body.amount;
    let answerIndex = req.body.answerIndex;
    let transactionHash = req.body.transactionHash

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
    // TODO add to the history of money transaction

    // add to the publicActivites table
    let publicActivites = {
        _id: "publicActivites$act",
        from: userId,
        answer: answerIndex,
        role: "participant",
        date: Math.floor(Date.now() / 1000),
        transactionHash: transactionHash,
        //    currencyType: currencyType,  TODO remove from DB Shema
        eventId: eventId,
        amount: Number(amount)
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

const validate = async (req: any, res: any) => {
    let setAnswer = []

    let eventId = Number(req.body.event_id);
    let from = Number(req.body.dataFromRedis.id)
    let reputation = req.body.reputation
    let transactionHash = req.body.transactionHash

    let answer = Number(req.body.answer);
    if (eventId == undefined ||
        answer == undefined ||
        from == undefined) {
        res.status(400);
        res.send("Structure is incorrect");
        return;
    }

    // add to the publicActivites table
    let publicActivites = {
        _id: "publicActivites$act1",
        from: from,
        answer: answer,
        role: "validator",
        date: Math.floor(Date.now() / 1000),
        transactionHash: transactionHash,
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


export {
    participate,
    validate
}
