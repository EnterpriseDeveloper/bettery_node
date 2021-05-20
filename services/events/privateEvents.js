const axios = require("axios");
const path = require("../../config/path");
const _ = require("lodash");
const createRoom = require('../rooms/createRoom');
const structure = require('../../structure/event.struct');
const contractInit = require("../../contract-services/contractInit");
const PrivateEvents = require("../../contract-services/abi/PrivateEvents.json");
const userData = require("../../helpers/userData");
const getNonce = require("../../contract-services/nonce/nonce");
const helpers = require("../../helpers/helpers");
const getRoom = require("../rooms/getRoom");

const createPrivateEvent = async (req, res) => {
    let allData = req.body;
    let id = "privateEvents$newEvents";
    allData.status = "deployed";
    allData._id = id;
    allData.finalAnswer = '';
    allData.dateCreation = Math.floor(Date.now() / 1000)

    if (req.body.thumImage !== "undefined") {
        let type = await helpers.uploadImage(req.body.thumImage, id);
        let url = process.env.NODE_ENV == "production" ? "http://api.bettery.io" : `http://13.229.200.135`
        allData.thumImage = `${url}/image/${id}.${type}`;
        allData.thumColor = undefined;
    } else if (req.body.thumColor !== "undefined") {
        allData.thumImage = undefined;
    } else if (req.body.thumColor === "undefined" && req.body.thumImage === "undefined") {
        allData.thumImage = undefined;
        if (whichRoom == "new") {
            allData.thumColor = req.body.roomColor;
        } else {
            allData.thumColor = await getRoom.getRoomColor(allData.roomId);
        }
    }


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

    try {
        let { wallet } = await userData.getUserWallet(req.body.host, res)
        let pathContr = process.env.NODE_ENV
        let contract = await contractInit.init(pathContr, PrivateEvents)

        let gasEstimate = await contract.methods.createEvent(eventId, startTime, endTime, questionQuantity, wallet).estimateGas();
        let nonce = await getNonce.getNonce();
        let transaction = await contract.methods.createEvent(eventId, startTime, endTime, questionQuantity, wallet).send({
            gas: Number((((gasEstimate * 5) / 100) + gasEstimate).toFixed(0)),
            gasPrice: 0,
            nonce: nonce
        });
        if (transaction) {
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
        }
    } catch (err) {
        console.log(err.message)
        res.status(400);
        res.send(err.message);
    }
}

const participate = async (req, res) => {
    let eventId = Number(req.body.eventId);
    let answer = Number(req.body.answer);
    let from = Number(req.body.from)
    if (eventId == undefined || answer == undefined || from == undefined) {
        res.status(400);
        res.send({ "error": "structure is incorrect" });
    } else {
        try {
            let { wallet } = await userData.getUserWallet(from, res)
            let pathContr = process.env.NODE_ENV
            let contract = await contractInit.init(pathContr, PrivateEvents)
            let gasEstimate = await contract.methods.setAnswer(eventId, answer, wallet).estimateGas();
            let nonce = await getNonce.getNonce();
            let transaction = await contract.methods.setAnswer(eventId, answer, wallet).send({
                gas: Number((((gasEstimate * 5) / 100) + gasEstimate).toFixed(0)),
                gasPrice: 0,
                nonce: nonce
            });

            if (transaction) {
                // private action structure
                let data = [{
                    _id: 'privateActivites$newEvents',
                    eventId: eventId,
                    date: Math.floor(Date.now() / 1000),
                    answer: answer,
                    transactionHash: transaction.transactionHash,
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
                await axios.post(`${path.path}/transact`, data).catch((err) => {
                    res.status(400);
                    res.send(err.response.data.message);
                    console.log("DB error: " + err.response.data.message)
                    return;
                })
                res.status(200);
                res.send({ done: "ok" });
            }
        } catch (err) {
            console.log(err.message)
            res.status(400);
            res.send(err.message);
        }
    }
}

const validate = async (req, res) => {
    let eventId = Number(req.body.eventId);
    let answer = req.body.answer;
    let answerNumber = Number(req.body.answerNumber);
    let from = Number(req.body.from)
    if (eventId == undefined || answer == undefined || from == undefined || answerNumber == undefined) {
        res.status(400);
        res.send({ "error": "structure is incorrect" });
    } else {
        try {
            let { wallet } = await userData.getUserWallet(from, res)
            let pathContr = process.env.NODE_ENV;
            let contract = await contractInit.init(pathContr, PrivateEvents)
            let gasEstimate = await contract.methods.setCorrectAnswer(eventId, answerNumber, wallet).estimateGas();
            let nonce = await getNonce.getNonce();
            let transaction = await contract.methods.setCorrectAnswer(eventId, answerNumber, wallet).send({
                gas: Number((((gasEstimate * 5) / 100) + gasEstimate).toFixed(0)),
                gasPrice: 0,
                nonce: nonce
            });

            if (transaction) {
                // private action structure
                let data = [{
                    _id: 'privateActivites$newEvents',
                    eventId: eventId,
                    date: Math.floor(Date.now() / 1000),
                    answer: answerNumber,
                    transactionHash: transaction.transactionHash,
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
        } catch (err) {
            console.log(err.message);
            res.status(400);
            res.send(err.message);
        }
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