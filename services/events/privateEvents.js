const axios = require("axios");
const path = require("../../config/path");
const _ = require("lodash");
const createRoom = require('../rooms/createRoom');
const structure = require('../../structure/event.struct');
const contractInit = require("../../contract-services/contractInit");
const PrivateEvents = require("../../contract-services/abi/PrivateEvents.json");

const createPrivateEvent = async (req, res) => {
    let allData = req.body;
    let id = "privateEvents$newEvents";
    allData.status = "deployed";
    allData._id = id;
    allData.finalAnswer = '';
    allData.dateCreation = Math.floor(Date.now() / 1000)

    delete allData.prodDev;
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

    // ADD to host
    let hostData = {
        _id: allData.host,
        hostPrivateEvents: [id],
    }

    data.push(hostData);
    let eventData = await axios.post(`${path.path}/transact`, data)
        .catch((err) => {
            console.log("DB error: " + err.response.data.message)
            res.status(400);
            res.send(err.response.data.message);
        })

    let eventId = eventData.data.tempids['privateEvents$newEvents']
    let startTime = req.body.startTime;
    let endTime = req.body.endTime;
    let questionQuantity = req.body.answers.length;

    let userConfig = {
        "select": ["users/wallet"],
        "from": Number(req.body.host)
    }
    let hostDataWallet = await axios.post(`${path.path}/query`, userConfig).catch((err) => {
        console.log("DB error: " + err.response.data.message)
        res.status(400);
        res.send(err.response.data.message);
    })

    let hostWallet = hostDataWallet.data[0]['users/wallet'];
    let contract = await contractInit.init(process.env.NODE_ENV, PrivateEvents)
    try {
        let gasEstimate = await contract.methods.createEvent(eventId, startTime, endTime, questionQuantity, hostWallet).estimateGas();
        let transaction = await contract.methods.createEvent(eventId, startTime, endTime, questionQuantity, hostWallet).send({
            gas: gasEstimate,
            gasPrice: 0
        });
        let transactionHash = transaction.transactionHash;

        // ADD transaction
        let transactionData = [{
            _id: eventId,
            transactionHash: transactionHash,
        }]

        await axios.post(`${path.path}/transact`, transactionData).catch((err) => {
            console.log("DB error: " + err.response.data.message)
            res.status(400);
            res.send(err.response.data.message);
        })

        res.status(200).send({ id: eventId });

    } catch (err) {
        console.log(err)
        res.status(400);
        res.send(err);
    }
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
    createPrivateEvent,
    getById,
    participate,
    validate
}