const axios = require("axios");
const path = require("../../config/path");
const _ = require("lodash");
const createRoom = require('../rooms/createRoom');
const structure = require('../../structure/event.struct');

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
        res.send(err.response);
    })
}

const createPrivateEvent = async (req, res) => {
    let allData = req.body;
    let data;
    if (req.body.whichRoom == "new") {
        let room = createRoom.createRoom(allData, "privateEventsId");
        allData.room = [room._id]
        delete allData.roomName;
        delete allData.roomColor;
        delete allData.whichRoom;
        delete allData.roomId;
        data = [
            room,
            allData
        ];
    } else {
        let room = {
            _id: Number(allData.roomId),
            privateEventsId: [Number(allData._id)]
        }
        allData.room = [Number(allData.roomId)]
        delete allData.roomName;
        delete allData.roomColor;
        delete allData.whichRoom;
        delete allData.roomId;
        data = [
            room,
            allData
        ]
    }

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
            validatorAnswer: "privateActivites$newEvents",
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

const getById = async (req, res) => {
    let id = Number(req.body.id);
    if (!id) {
        res.status(400);
        res.send({ "error": "do not have id" });
    } else {
        let conf = {
            "select": ["*",
                { 'privateEvents/parcipiantsAnswer': ["*", { "privateActivites/from": ["*"] }] },
                { 'privateEvents/validatorAnswer': ["*", { "privateActivites/from": ["*"] }] },
                { 'privateEvents/host': ["*"] },
                { 'privateEvents/room': ["*"] }
            ],
            "from": id
        }

        let event = await axios.post(path.path + "/query", conf).catch((err) => {
            res.status(400);
            res.send(err.response.data);
            console.log("DB error: " + err.response.data)
        })
        if (event) {
            if (event.data.length != 0) {
                let obj = structure.privateEventStructure([event.data[0]])
                res.status(200)
                res.send(obj[0])
            } else {
                res.status(404);
                res.send({ "error": "event not found" });
            }
        }
    }
}

module.exports = {
    createId,
    createPrivateEvent,
    getById,
    participate,
    validate
}