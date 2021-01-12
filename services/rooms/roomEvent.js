const axios = require('axios');
const path = require('../../config/path');
const structure = require('../../structure/event.struct');
const _ = require("lodash");

const getEventByRoomId = async (req, res) => {
    let id = req.body.id;
    let eventData = await getData(id, res);

    if (eventData !== undefined) {
        let events = structure.publicEventStructure(eventData.data)
        res.status(200);
        res.send(events);
    }
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