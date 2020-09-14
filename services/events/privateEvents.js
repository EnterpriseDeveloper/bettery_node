const axios = require("axios");
const path = require("../../config/path");
const _ = require("lodash");

const createId = (req, res) => {
    let data = [{
        _id: "privateEvents$newEvents",
        finalAnswer: ''
    }]
    axios.post(path.path + "/transact", data).then((x) => {
        res.status(200);
        res.send({ "_id": x.data.tempids['privateEvents$newEvents'] })
    }).catch((err) => {
        res.status(400);
        res.send(err.response.data.message);
    })
}

const createPrivateEvent = async (req, res) => {
    let allData = req.body;
    let data = [];
    data.push(allData);
    axios.post(path.path + "/transact", data).then(() => {
        // ADD to host
        let hostData = [{
            _id: allData.host,
            hostPrivateEvents: [allData._id],
        }]

        axios.post(path.path + "/transact", hostData).then(() => {
            res.status(200).send();
        }).catch((err) => {
            console.log("DB error: " + err.response.data.message)
            res.status(400);
            res.send(err.response.data.message);
        })
    }).catch((err) => {
        console.log("DB error: " + err.response.data.message)
        res.status(400);
        res.send(err.response.data.message);
    })
}

const participate = (req, res) => {
    let eventId = Number(req.body.eventId);
    let date = req.body.date;
    let answer = Number(req.body.answer);
    let transactionHash = req.body.transactionHash;
    let from = Number(req.body.from)
    console.log(req.body)
    if (eventId == undefined || date == undefined || answer == undefined || transactionHash == undefined || from == undefined) {
        res.status(400);
        res.send({ "error": "structure is incorrect" });
    } else {
        // private action structure
        let data = [{
            _id: 'privateActivites$newEvents',
            eventId: eventId,
            date: date,
            answer: answer,
            transactionHash: transactionHash,
            from: from,
            role: "participate"
        }]
        // add to user table
        data.push({
            _id: from,
            privateActivites: ["privateActivites$newEvents"],
        })
        // add to event
        data.push({
            _id: eventId,
            parcipiantsAnswer: ["privateActivites$newEvents"],
        })
        axios.post(path.path + "/transact", data).then(() => {
            res.status(200);
            res.send({ done: "ok" });
        }).catch((err) => {
            res.status(400);
            res.send(err.response.data.message);
            console.log("DB error: " + err.response.data.message)
        })
    }
}

const validate = (req, res) => {
    let eventId = Number(req.body.eventId);
    let date = req.body.date;
    let answer = req.body.answer;
    let answerNumber = Number(req.body.answerNumber);
    let transactionHash = req.body.transactionHash;
    let from = Number(req.body.from)
    if (eventId == undefined || date == undefined || answer == undefined || transactionHash == undefined || from == undefined || answerNumber == undefined) {
        res.status(400);
        res.send({ "error": "structure is incorrect" });
    } else {
        // private action structure
        let data = [{
            _id: 'privateActivites$newEvents',
            eventId: eventId,
            date: date,
            answer: answerNumber,
            transactionHash: transactionHash,
            from: from,
            role: "validate"
        }]
        // add to user table
        data.push({
            _id: from,
            privateActivites: ["privateActivites$newEvents"],
        })
        // add to event
        data.push({
            _id: eventId,
            parcipiantsAnswer: ["privateActivites$newEvents"],
            finalAnswerNumber: answerNumber,
            finalAnswer: answer
        })
        axios.post(path.path + "/transact", data).then(() => {
            res.status(200);
            res.send({ done: "ok" });
        }).catch((err) => {
            res.status(400);
            res.send(err.response.data.message);
            console.log("DB error: " + err.response.data.message)
        })
    }
}

const getById = (req, res) => {
    let id = Number(req.body.id);
    if (!id) {
        res.status(400);
        res.send({ "error": "do not have id" });
    } else {
        let conf = {
            "select": ["*",
                { 'privateEvents/parcipiantsAnswer': ["*", { "privateActivites/from": ["*"] }] },
                { 'privateEvents/host': ["*"] }
            ],
            "from": id
        }

        axios.post(path.path + "/query", conf).then((x) => {
            if (x.data.length != 0) {
                let obj = eventStructure([x.data[0]])
                let filter = _.filter(obj[0].parcipiantAnswers, (o) => { return o.role !== 'validate'; });
                obj[0].parcipiantAnswers = filter;
                res.status(200)
                res.send(obj[0])
            } else {
                res.status(404);
                res.send({ "error": "event not found" });
            }
        }).catch((err) => {
            res.status(400);
            res.send(err.response.data.message);
            console.log("DB error: " + err.response.data.message)
        })
    }
}

function eventStructure(data) {
    return data.map((z) => {
        return {
            winner: z['privateEvents/winner'],
            loser: z['privateEvents/loser'],
            startTime: z['privateEvents/startTime'],
            endTime: z['privateEvents/endTime'],
            transactionHash: z['privateEvents/transactionHash'],
            id: z._id,
            status: z['privateEvents/status'],
            question: z['privateEvents/question'],
            answers: z["privateEvents/answers"],
            host: {
                id: z['privateEvents/host']["_id"],
                nickName: z['privateEvents/host']['users/nickName'],
                avatat: z['privateEvents/host']['users/avatar'],
                wallet: z['privateEvents/host']['users/wallet']
            },
            finalAnswer: z["privateEvents/finalAnswer"],
            parcipiantAnswers: z["privateEvents/parcipiantsAnswer"] === undefined ? undefined : z["privateEvents/parcipiantsAnswer"].map((par) => {
                return {
                    transactionHash: par['privateActivites/transactionHash'],
                    date: par['privateActivites/date'],
                    answer: par['privateActivites/answer'],
                    userId: par['privateActivites/from']['_id'],
                    avatar: par['privateActivites/from']['users/avatar'],
                    role: par['privateActivites/role']
                }
            }),
        }
    })
}

module.exports = {
    createId,
    createPrivateEvent,
    getById,
    participate,
    validate
}