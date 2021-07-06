import axios from "axios";
import { path } from "../../config/path";
import { createRoom } from '../rooms/createRoom';
import { privateEventStructure } from '../../structure/event.struct';
import { init } from "../../contract-services/contractInit";
import PrivateEvents from "../../contract-services/abi/PrivateEvents.json";
import { getNonce } from "../../contract-services/nonce/nonce";
import { uploadImage } from "../../helpers/helpers";
import { getRoomColor } from "../rooms/getRoom";
import { getGasPrice } from "../../contract-services/gasPrice/getGasPrice";
import { gasPercent } from "../../config/limits"

const createPrivateEvent = async (req: any, res: any) => {
    let allData = req.body;
    allData.host = allData.dataFromRedis.id
    let wallet = allData.dataFromRedis.wallet
    delete allData.dataFromRedis
    let id = "privateEvents$newEvents";
    allData.status = "deployed";
    allData._id = id;
    allData.finalAnswer = '';
    allData.dateCreation = Math.floor(Date.now() / 1000)

    if (req.body.thumImage !== "undefined") {
        let type = await uploadImage(req.body.thumImage, id);
        let url = process.env.NODE_ENV == "production" ? "https://api.bettery.io" : `https://apitest.bettery.io`
        allData.thumImage = `${url}/image/${id}.${type}`;
        allData.thumColor = undefined;
    } else if (req.body.thumColor !== "undefined") {
        allData.thumImage = undefined;
    } else if (req.body.thumColor === "undefined" && req.body.thumImage === "undefined") {
        allData.thumImage = undefined;
        if (req.body.whichRoom == "new") {
            allData.thumColor = req.body.roomColor;
        } else {
            allData.thumColor = await getRoomColor(allData.roomId);
        }
    }


    delete allData.prodDev;
    let data;
    if (req.body.whichRoom == "new") {
        let room = createRoom(allData, "privateEventsId");
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
    let eventData: any = await axios.post(`${path}/transact`, data)
        .catch((err: any) => {
            console.log("DB error: " + err.response.data.message)
            res.status(400);
            res.send(err.response.data.message);
        })

    let eventId = eventData.data.tempids['privateEvents$newEvents']
    let startTime = req.body.startTime;
    let endTime = req.body.endTime;
    let questionQuantity = req.body.answers.length;

    try {
        let pathContr = process.env.NODE_ENV
        let contract = await init(pathContr, PrivateEvents)

        let gasEstimate = await contract.methods.createEvent(eventId, startTime, endTime, questionQuantity, wallet).estimateGas();
        let transaction = await contract.methods.createEvent(eventId, startTime, endTime, questionQuantity, wallet).send({
            gas: Number((((gasEstimate * gasPercent) / 100) + gasEstimate).toFixed(0)),
            gasPrice: await getGasPrice(),
            nonce: await getNonce()
        });
        if (transaction) {
            let transactionHash = transaction.transactionHash;

            // ADD transaction
            let transactionData = [{
                _id: eventId,
                transactionHash: transactionHash,
            }]

            await axios.post(`${path}/transact`, transactionData).catch((err: any) => {
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

const privParticipate = async (req: any, res: any) => {
    let eventId = Number(req.body.eventId);
    let answer = Number(req.body.answer);
    let from = req.body.dataFromRedis.id;
    if (eventId == undefined || answer == undefined || from == undefined) {
        res.status(400);
        res.send({ "error": "structure is incorrect" });
    } else {
        try {
            let wallet = req.body.dataFromRedis.wallet
            let pathContr = process.env.NODE_ENV
            let contract = await init(pathContr, PrivateEvents)
            let gasEstimate = await contract.methods.setAnswer(eventId, answer, wallet).estimateGas();
            let transaction = await contract.methods.setAnswer(eventId, answer, wallet).send({
                gas: Number((((gasEstimate * gasPercent) / 100) + gasEstimate).toFixed(0)),
                gasPrice: await getGasPrice(),
                nonce: await getNonce()
            });

            if (transaction) {
                // private action structure
                let data: any = [{
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
                await axios.post(`${path}/transact`, data).catch((err: any) => {
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

const privValidate = async (req: any, res: any) => {
    let eventId = Number(req.body.eventId);
    let answer = req.body.answer;
    let answerNumber = Number(req.body.answerNumber);
    let from = Number(req.body.dataFromRedis.id)
    if (eventId == undefined || answer == undefined || from == undefined || answerNumber == undefined) {
        res.status(400);
        res.send({ "error": "structure is incorrect" });
    } else {
        try {
            let wallet = req.body.dataFromRedis.wallet;
            let pathContr = process.env.NODE_ENV;
            let contract = await init(pathContr, PrivateEvents)
            let gasEstimate = await contract.methods.setCorrectAnswer(eventId, answerNumber, wallet).estimateGas();
            let transaction = await contract.methods.setCorrectAnswer(eventId, answerNumber, wallet).send({
                gas: Number((((gasEstimate * gasPercent) / 100) + gasEstimate).toFixed(0)),
                gasPrice: await getGasPrice(),
                nonce: await getNonce()
            });

            if (transaction) {
                // private action structure
                let data: any = [{
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
                axios.post(path + "/transact", data).then(() => {
                    res.status(200);
                    res.send({ done: "ok" });
                }).catch((err: any) => {
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

const privGetById = async (req: any, res: any) => {
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

        let event = await axios.post(path + "/query", conf).catch((err: any) => {
            res.status(400);
            res.send(err.response.data);
            console.log("DB error: " + err.response.data)
        })
        if (event) {
            if (event.data.length != 0) {
                let obj = privateEventStructure([event.data[0]])
                res.status(200)
                res.send(obj[0])
            } else {
                res.status(404);
                res.send({ "error": "event not found" });
            }
        }
    }
}

export {
    createPrivateEvent,
    privGetById,
    privParticipate,
    privValidate
}
