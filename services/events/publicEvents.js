const axios = require("axios");
const path = require("../../config/path");
const invites = require("./invites");
const _ = require("lodash");
const createRoom = require('../rooms/createRoom');
const structire = require('../../structure/event.struct');
const filterData = require('../../helpers/filter');
const sortData = require('../../helpers/sorting');
const additionalData = require('../../helpers/additionalData');
const notification = require('../rooms/notification');


const createId = (req, res) => {
    let data = {
        _id: "publicEvents$newEvents",
        finalAnswer: ''
    }
    axios.post(path.path + "/transact", [data]).then((x) => {
        res.status(200);
        res.send({ "_id": x.data.tempids['publicEvents$newEvents'] })
    }).catch((err) => {
        res.status(400);
        res.send(err.response);
    })
}

const setQuestion = (req, res) => {
    let allData = req.body
    let hashtagsId = req.body.hashtagsId;
    let hostId = allData.host;
    let roomId = allData.roomId;
    let eventId = allData._id;

    delete allData['getCoinsForHold'];
    delete allData['finalAnswers'];
    allData.invites = []
    let data = []

    // add room
    if (req.body.whichRoom == "new") {
        let room = createRoom.createRoom(allData, "publicEventsId");
        allData.room = [room._id]
        delete allData.roomName;
        delete allData.roomColor;
        delete allData.whichRoom;
        delete allData.roomId;
        data.push(room);
    } else {
        let room = {
            _id: Number(roomId),
            publicEventsId: [Number(eventId)]
        }
        data.push(room);
        allData.room = [Number(roomId)]

        // Add notification
        notification.sendNotificationToUser(roomId, eventId, res);

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

    axios.post(path.path + "/transact", data).then((x) => {

        // ADD to host
        let hostData = [{
            _id: hostId,
            hostPublicEvents: [eventId],
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

const getById = (req, res) => {
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

    axios.post(path.path + "/query", conf).then((x) => {
        if (x.data.length !== 0) {
            let obj = structire.publicEventStructure([x.data[0]]);
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

const getAll = async (req, res) => {
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

    let x = await axios.post(path.path + "/query", conf)
        .catch((err) => {
            res.status(400);
            res.send(err.response.data.message);
            console.log("DB error: " + err.response.data.message)
            return;
        })

    let obj = structire.publicEventStructure(x.data)

    // filter
    let dataEvetns = search.length >= 1 ? filterData.searchData(obj, search) : obj;

    if (!finished) {
        dataEvetns = _.filter(dataEvetns, (e) => { return e.finalAnswer === null })
    }

    let soringData;
    // soring
    switch (sort) {
        case 'trending':
            soringData = sortData.trendingSorting(dataEvetns);
            sendResponceAllEvents(res, soringData, from, to, obj);
            break;
        case 'controversial':
            soringData = sortData.controversialSorting(dataEvetns);
            sendResponceAllEvents(res, soringData, from, to, obj);
            break;
    }
}

const sendResponceAllEvents = async (res, dataEvetns, from, to, obj) => {
    let events = {
        allAmountEvents: obj.length,
        amount: dataEvetns.length,
        events: await additionalData.getAdditionalData(dataEvetns.slice(from, to), res)
    }
    res.status(200)
    res.send(events)
}

const getBetteryEvent = async (req, res) => {
    let email = req.body.email
    if (email == undefined) {
        res.status(400);
        res.send("email is undefined");
    } else {
        let userInfo = {
            "select": ["_id"],
            "where": `users/email = \"${email}\"`
        }
        let getUserInfo = await axios.post(path.path + "/query", userInfo).catch((err) => {
            res.status(400);
            res.send(err.response.data);
            return
        })
        if (getUserInfo) {
            let id = getUserInfo.data[0]._id;
            let conf = {
                "select": ["publicEvents/question", "_id", "publicEvents/startTime"],
                "where": `publicEvents/host = ${id}`
            }
            let data = await axios.post(path.path + "/query", conf).catch((err) => {
                res.status(400);
                res.send(err.response.data);
                return
            })
            if (data) {
                let sortByTime = _.sortBy(data.data, [function (o) { return o["publicEvents/startTime"]; }]);
                let getLast = sortByTime.slice(Math.max(sortByTime.length - 5, 0))
                res.status(200);
                res.send(getLast);
            }
        }
    }
}

module.exports = {
    setQuestion,
    getById,
    getAll,
    createId,
    getBetteryEvent
}