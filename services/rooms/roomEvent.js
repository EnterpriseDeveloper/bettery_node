const axios = require('axios');
const path = require('../../config/path');
const structure = require('../../structure/event.struct');
const _ = require("lodash");
const helpers = require("../../helpers/helpers");

const getEventByRoomId = async (req, res) => {
    let id = req.body.id;
    let from = req.body.from;
    let to = req.body.to;
    let search = req.body.search != undefined ? req.body.search : '';

    let eventData = await getData(id, res);

    if (eventData !== undefined) {

        let obj = structure.publicEventStructure(eventData.data);

        let dataEvetns = search.length >= 1 ? helpers.searchData(obj, search) : obj;

        let events = {
            amount: dataEvetns.length,
            events: await getCommentsAmount(dataEvetns.slice(from, to), res)
        }
        res.status(200)
        res.send(events)
    }
}

const getCommentsAmount = async (events, res) => {
    for (let i = 0; i < events.length; i++) {
        let conf = {
            "select": ["*"],
            "where": `comments/publicEventsId = ${Number(events[i].id)}`
        }
        let comments = await axios.post(path.path + "/query", conf)
            .catch((err) => {
                res.status(400);
                res.send(err.response.data.message);
                console.log("DB error: " + err.response.data.message)
                return;
            })

        events[i].commentsAmount = comments.data.length
        if (comments.data.length != 0) {
            let lastComments = _.maxBy(comments.data, function (o) {
                return o['comments/date'];
            })
            events[i].lastComment = lastComments['comments/comment'];
        } else {
            events[i].lastComment = "null";
        }
    }

    return events;
}

const roomInfo = async (req, res) => {
    let id = req.body.id;
    let eventData = await getData(id, res);
    let hostData = await getHostData(id, res);

    if (eventData !== undefined) {
        let room = {
            name: eventData.data[0]["publicEvents/room"][0]["room/name"],
            color: eventData.data[0]["publicEvents/room"][0]["room/color"],
            hostId: hostData[0]['room/owner']['_id'],
            host: hostData[0]['room/owner']['users/nickName'],
            hostAvatar: hostData[0]['room/owner']['users/avatar'],
            events: eventData.data.length,
            activeEvents: getActiveEvents(eventData.data),
            members: "todo"
        }
        res.status(200);
        res.send(room);
    }
}

const getActiveEvents = (data) => {
    let events = _.filter(data, (x) => { return x['publicEvents/finalAnswer'] == '' })
    return events.length;
}

const getHostData = async (id, res) => {
    let host = {
        "select": ["*",
            { "room/owner": ["*"] }
        ],
        "from": id,
    }

    const hostData = await axios.post(`${path.path}/query`, host).catch((err) => {
        res.status(404);
        res.send({ message: err });
        return undefined;
    })

    return hostData.data;

}

const getData = async (id, res) => {
    let event = {
        "select": ["*",
            { 'publicEvents/parcipiantsAnswer': ["*", { "publicActivites/from": ["*"] }] },
            { 'publicEvents/validatorsAnswer': ["*", { "publicActivites/from": ["*"] }] },
            { 'publicEvents/host': ["*"] },
            { 'publicEvents/room': ["*"] }
        ],
        "where": `publicEvents/room = ${Number(id)}`
    }

    const eventData = await axios.post(`${path.path}/query`, event).catch((err) => {
        res.status(404);
        res.send({ message: err });
        return undefined;
    })
    return eventData;
}

module.exports = {
    getEventByRoomId,
    roomInfo
}