const axios = require('axios');
const path = require('../../config/path');
const structure = require('../../structure/event.struct');
const _ = require("lodash");
const helpers = require('../../helpers/filter');

const getEventByRoomId = async (req, res) => {
    let id = req.body.id;
    let from = req.body.from;
    let to = req.body.to;
    let search = req.body.search != undefined ? req.body.search : '';

    let eventData = await getData(id, res);

    if (eventData !== undefined) {

        let roomEvent = structure.publicEventStructure(eventData.data);
        let dataEvetns = search.length >= 1 ? helpers.searchData(roomEvent, search) : roomEvent;

        let events = {
            allAmountEvents: roomEvent.length,
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
            "select": ["comments/comment", "comments/date"],
            "where": `comments/publicEventsId = ${Number(events[i].id)}`,
            "opts": {"orderBy": ["DESC", "comments/date"] }
        }
        let comments = await axios.post(path.path + "/query", conf)
            .catch((err) => {
                res.status(400);
                res.send(err.response);
                console.log("DB error: " + err.response)
                return;
            })

        events[i].commentsAmount = comments.data.length
        if (comments.data.length != 0) {
            events[i].lastComment = comments.data[0]['comments/comment'];
        } else {
            events[i].lastComment = "null";
        }
    }

    return events;
}

const roomInfo = async (req, res) => {
    let roomId = req.body.roomId;
    let userId = req.body.userId;
    let eventData = await getData(roomId, res);
    let hostData = await getHostData(roomId, res);

    let joined = findJoined(userId, hostData[0]['room/joinedUsers'])

    if (eventData !== undefined) {
        let room = {
            name: eventData.data[0]["publicEvents/room"][0]["room/name"],
            color: eventData.data[0]["publicEvents/room"][0]["room/color"],
            hostId: hostData[0]['room/owner']['_id'],
            host: hostData[0]['room/owner']['users/nickName'],
            hostAvatar: hostData[0]['room/owner']['users/avatar'],
            events: eventData.data.length,
            activeEvents: getActiveEvents(eventData.data),
            members: hostData[0]['room/joinedUsers'] == undefined ? 0 : hostData[0]['room/joinedUsers'].length,
            joined: joined == undefined ? false : true,
            notifications: joined == undefined ? undefined : joined['joinRoom/notifications'],
            joinedId: joined == undefined ? undefined : joined["_id"]
        }
        res.status(200);
        res.send(room);
    }
}

const findJoined = (userId, data) => {
    return _.find(data, (x) => { return x['joinRoom/userId']["_id"] == userId });
}

const getActiveEvents = (data) => {
    let events = _.filter(data, (x) => {
        return x['publicEvents/finalAnswerNumber'] == undefined && x['publicEvents/status'].search("reverted") == -1
    })
    return events.length;
}

const getHostData = async (id, res) => {
    let host = {
        "select": ["*",
            {
                "room/joinedUsers": ["*"],
                "room/owner": ["*"]
            }
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
        "where": `publicEvents/room = ${Number(id)}`,
        "opts": {"orderBy": ["DESC", "publicEvents/startTime"]}
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