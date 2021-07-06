import axios from "axios";
import { path } from "../../config/path";
import { createRoom } from '../rooms/createRoom';
import { getRoomColor } from "../rooms/getRoom";
import { publicEventStructure } from '../../structure/event.struct';
import { searchData } from '../../helpers/filter';
import { trendingSorting, controversialSorting } from '../../helpers/sorting';
import { getAdditionalData } from '../../helpers/additionalData';
import { sendNotificationToUser } from '../rooms/notification';
import { init } from "../../contract-services/contractInit";
import PublicEvents from "../../contract-services/abi/PublicEvents.json";
import { getNonce } from "../../contract-services/nonce/nonce";
import { uploadImage } from "../../helpers/helpers";
import { getGasPrice } from "../../contract-services/gasPrice/getGasPrice";
import { gasPercent } from "../../config/limits"

const createEvent = async (req: any, res: any) => {
    req.body.host = req.body.dataFromRedis.id
    let wallet = req.body.dataFromRedis.wallet
    let dateNow = Number((new Date().getTime() / 1000).toFixed(0))

    if (dateNow > req.body.endTime) {
        res.status(400);
        res.send("Please check your event end time. This time already passed.");
        return;
    }

    // create event id
    let createEventID = [{
        _id: "publicEvents$newEvents",
        status: 'id created',
    }]
    let eventData: any = await axios.post(`${path}/transact`, createEventID)
        .catch((err) => {
            console.log("DB error: " + err.response.data.message)
            res.status(400);
            res.send(err.response.data.message);
        })

    let id = eventData.data.tempids["publicEvents$newEvents"];

    try {
        let startTime = req.body.startTime;
        let endTime = req.body.endTime;
        let questionQuantity = req.body.answers.length;
        let amountExperts = req.body.calculateExperts === "company" ? 0 : req.body.validatorsAmount;
        let calculateExperts = req.body.calculateExperts === "company" ? true : false
        let amountPremiumEvent = req.body.amount;
        let pathContr = process.env.NODE_ENV;
        let contract = await init(pathContr, PublicEvents)

        let gasEstimate = await contract.methods.newEvent(id, startTime, endTime, questionQuantity, amountExperts, calculateExperts, wallet, amountPremiumEvent).estimateGas();
        let transaction = await contract.methods.newEvent(id, startTime, endTime, questionQuantity, amountExperts, calculateExperts, wallet, amountPremiumEvent).send({
            gas: Number((((gasEstimate * gasPercent) / 100) + gasEstimate).toFixed(0)),
            gasPrice: await getGasPrice(),
            nonce: await getNonce()
        });
        if (transaction) {
            let allData = req.body
            delete allData.dataFromRedis

            // upload image
            if (req.body.thumImage != "undefined") {
                let type = await uploadImage(req.body.thumImage, id);
                let url = process.env.NODE_ENV == "production" ? "https://api.bettery.io" : `https://apitest.bettery.io`
                allData.thumImage = `${url}/image/${id}.${type}`;
                allData.thumColor = undefined;
            } else if (req.body.thumColor != "undefined") {
                allData.thumImage = undefined;
            } else if (req.body.thumColor === "undefined" && req.body.thumImage === "undefined") {
                allData.thumImage = undefined;
                if (req.body.whichRoom == "new") {
                    allData.thumColor = req.body.roomColor;
                } else {
                    allData.thumColor = await getRoomColor(allData.roomId);
                }
            }

            let hashtagsId = req.body.hashtagsId;
            let hostId = allData.host;
            let roomId = allData.roomId;
            let whichRoom = req.body.whichRoom;

            delete allData.amount;
            delete allData.calculateExperts;

            //TODO add to the history host tokens amount in premium events

            allData.premiumTokens = amountPremiumEvent
            allData._id = id;
            allData.finalAnswer = "";
            allData.dateCreation = Math.floor(Date.now() / 1000)
            allData.status = "deployed";
            allData.validated = 0;
            allData.transactionHash = transaction.transactionHash;
            let data = []

            // add room
            if (whichRoom == "new") {
                let room = createRoom(allData, "publicEventsId");
                allData.room = [room._id]
                delete allData.roomName;
                delete allData.roomColor;
                delete allData.whichRoom;
                delete allData.roomId;
                data.push(room);
            } else {
                let room = {
                    _id: Number(roomId),
                    publicEventsId: [Number(id)]
                }
                data.push(room);
                allData.room = [Number(roomId)]

                // Add notification
                sendNotificationToUser(roomId, id, res);

                delete allData.roomName;
                delete allData.roomColor;
                delete allData.whichRoom;
                delete allData.roomId;
            }

            if (allData.hashtags.length !== 0) {
                data.push({
                    _id: hashtagsId,
                    hashtags: allData.hashtags
                })
                delete allData['hashtagsId'];
            } else {
                delete allData['hashtagsId'];
            }
            data.push(allData)
            // ADD to host
            data.push({
                _id: hostId,
                hostPublicEvents: [id],
            })
            await axios.post(path + "/transact", data).catch((err) => {
                console.log("DB error: " + err.response.data.message)
                res.status(400);
                res.send(err.response.data.message);
                return;
            })
            if (whichRoom == 'new') {
                let roomId = await getRoomId(id, res);
                res.status(200).send({
                    roomId: roomId,
                    eventId: id
                });
            } else {
                res.status(200).send({
                    roomId: roomId,
                    eventId: id
                });
            }
        }

    } catch (err) {
        console.log(err);
        // remove event id
        let removeEvent = [{
            _id: id,
            _action: 'delete',
        }]
        axios.post(`${path}/transact`, removeEvent)
            .catch((err) => {
                console.log("DB error: " + err.response.data.message)
                res.status(400);
                res.send(err.response.data.message);
            })
        res.status(400);
        console.log(err.message);
    }
}

const getRoomId = async (eventId: any, res: any) => {
    let conf = {
        "select": [{ "room": ["_id"] }],
        "from": eventId
    }

    let data: any = await axios.post(`${path}/query`, conf).catch((err) => {
        console.log("DB error: " + err.response.data.message)
        res.status(400);
        res.send(err.response.data.message);
        return;
    })
    return data.data[0].room[0]['_id'];
}

const getById = (req: any, res: any) => {
    let id = Number(req.body.id);

    let conf = {
        "select": ["*",
            { 'publicEvents/parcipiantsAnswer': ["*", { "publicActivites/from": ["*"] }] },
            { 'publicEvents/validatorsAnswer': ["*", { "publicActivites/from": ["*"] }] },
            { 'publicEvents/host': ["*"] },
            { 'publicEvents/room': ["*"] }
        ],
        "from": id
    }

    axios.post(path + "/query", conf).then((x) => {
        if (x.data.length !== 0) {
            let obj = publicEventStructure([x.data[0]]);
            res.status(200)
            res.send(obj[0])
        } else {
            res.status(404);
            res.send({ message: "event not found" });
        }

    }).catch((err) => {
        res.status(400);
        res.send(err.response.data.message);
        console.log("DB error: " + err.response.data.message)
    })

}

const getAll = async (req: any, res: any) => {
    let from = req.body.from;
    let to = req.body.to;
    let search = req.body.search != undefined ? req.body.search : '';
    let sort = req.body.sort != undefined ? req.body.sort : 'trending' // controversial 
    let finished = req.body.finished;

    let conf = {
        "select": ["*",
            { 'publicEvents/parcipiantsAnswer': ["*", { "publicActivites/from": ["*"] }] },
            { 'publicEvents/validatorsAnswer': ["*", { "publicActivites/from": ["*"] }] },
            { 'publicEvents/host': ["*"] },
            { 'publicEvents/room': ["*"] }
        ],
        "from": "publicEvents"
    }

    let x: any = await axios.post(path + "/query", conf)
        .catch((err) => {
            res.status(400);
            res.send(err.response.data.message);
            console.log("DB error: " + err.response.data.message)
            return;
        })

    let obj = publicEventStructure(x.data)

    // filter
    let dataEvetns = search.length >= 1 ? searchData(obj, search) : obj;

    if (!finished) {
        dataEvetns = dataEvetns.filter((e: any) => { return e.finalAnswer === null && e.status.search("reverted") == -1 })
    }

    let soringData;
    // soring
    switch (sort) {
        case 'trending':
            soringData = trendingSorting(dataEvetns);
            sendResponceAllEvents(res, soringData, from, to, obj);
            break;
        case 'controversial':
            soringData = controversialSorting(dataEvetns);
            sendResponceAllEvents(res, soringData, from, to, obj);
            break;
    }
}

const sendResponceAllEvents = async (res: any, dataEvetns: any, from: any, to: any, obj: any) => {
    let events = {
        allAmountEvents: obj.length,
        amount: dataEvetns.length,
        events: await getAdditionalData(dataEvetns.slice(from, to), res)
    }
    res.status(200)
    res.send(events)
}

const getBetteryEvent = async (req: any, res: any) => {
    let email = req.body.email
    if (email == undefined) {
        res.status(400);
        res.send("email is undefined");
    } else {
        let userInfo = {
            "select": ["_id"],
            "where": `users/email = \"${email}\"`
        }
        let getUserInfo = await axios.post(path + "/query", userInfo).catch((err) => {
            res.status(400);
            res.send(err.response.data);
            return
        })
        if (getUserInfo) {
            let id = getUserInfo.data[0]._id;
            let conf = {
                "select": ["publicEvents/question", "_id", "publicEvents/startTime", "room"],
                "where": `publicEvents/host = ${id}`,
                "opts": { "orderBy": ["DESC", "publicEvents/startTime"] }
            }
            let data = await axios.post(path + "/query", conf).catch((err) => {
                res.status(400);
                res.send(err.response.data);
                return
            })
            if (data) {
                let getLast = data.data.slice(Math.max(data.data.length - 5, 0))
                res.status(200);
                res.send(getLast);
            }
        }
    }
}

const getAllForTest = async (req: any, res: any) => {
    let conf = {
        "select": ["*",
            { 'publicEvents/parcipiantsAnswer': ["*", { "publicActivites/from": ["*"] }] },
            { 'publicEvents/validatorsAnswer': ["*", { "publicActivites/from": ["*"] }] },
            { 'publicEvents/host': ["*"] },
            { 'publicEvents/room': ["*"] }
        ],
        "from": "publicEvents"
    }

    let x: any = await axios.post(path + "/query", conf)
        .catch((err) => {
            res.status(400);
            res.send(err.response.data.message);
            console.log("DB error: " + err.response.data.message)
            return;
        })

    let obj = publicEventStructure(x.data)
    res.status(200);
    res.send(obj);
}

export {
    createEvent,
    getById,
    getAll,
    getBetteryEvent,
    getAllForTest
}
