const axios = require('axios');
const path = require("../../config/path");
const _ = require('lodash');
const struct = require('../../structure/room.struct');

const getByUserId = async (req, res) => {
    let userId = req.body.dataFromRedis.id
    let getRooms = {
        "select": ["*", { 'room/owner': ["users/nickName", "users/avatar"] }],
        "where": `room/owner = ${Number(userId)}`
    }

    let rooms = await axios.post(`${path.path}/query`, getRooms).catch(err => {
        res.status(400);
        res.send(err.response.data.message);
        console.log("DB error: " + err.response.data.message);
        return;
    })
    let obj = struct.roomStruct(rooms.data)
    // filter rooms with private events
    let data = _.filter(obj, (x) => { return x.publicEventsId.length != 0 })
    res.status(200)
    res.send(data)

}

const getAllRooms = async (req, res) => {
    let getRooms = {
        "select": ["*", { 'room/owner': ["users/nickName", "users/avatar"] }],
        "from": "room"
    }

    let rooms = await axios.post(`${path.path}/query`, getRooms).catch(err => {
        res.status(400);
        res.send(err.response.data.message);
        console.log("DB error: " + err.response.data.message);
        return;
    })
    let obj = struct.roomStruct(rooms.data);
    // filter rooms with private events
    let data = _.filter(obj, (x) => { return x.publicEventsId.length != 0 })

    for (let i = 0; i < data.length; i++) {
        data[i].publicEventsId = data[i].publicEventsId.reverse();
    }
    res.status(200)
    res.send(data);

}

const roomValidation = async (req, res) => {
    let roomName = req.body.name;
    let userId = req.body.dataFromRedis.id

    let findRoom = {
        "select": ["*"],
        "where": `room/owner = ${Number(userId)}`
    }
    let rooms = await axios.post(`${path.path}/query`, findRoom).catch(err => {
        res.status(400);
        res.send(err.response.data.message);
        console.log("DB error: " + err.response.data.message)
        return;
    })
    if (rooms.data.length !== 0) {
        let findUser = _.find(rooms.data, (x) => { return x['room/name'] == roomName })
        if (findUser !== undefined) {
            res.status(400);
            res.send({ message: "room with this name already exist" })
        } else {
            res.status(200);
            res.send({ message: "ok" })
        }
    } else {
        res.status(200);
        res.send({ message: "ok" })
    }
}

const getJoinedRoom = async (req, res) => {
    let id = req.body.dataFromRedis.id;
    let allRooms = [];
    let config = {
        "select": [{ "users/joinedRooms": [{ "joinRoom/roomId": ["*", { 'room/owner': ["*"] }] }] }],
        "from": Number(id)
    }

    let rooms = await axios.post(`${path.path}/query`, config).catch(err => {
        res.status(400);
        res.send(err.response.data.message);
        console.log("DB error: " + err.response.data.message)
        return;
    })

    if (rooms.data[0]['users/joinedRooms'] !== undefined) {
        rooms.data[0]['users/joinedRooms'].forEach((x) => {
            allRooms.push(x['joinRoom/roomId'])
        })

        let obj = struct.roomStruct(allRooms);
        // filter rooms with private events
        let data = _.filter(obj, (x) => { return x.publicEventsId.length != 0 })
        res.status(200)
        res.send(data)
    } else {
        res.status(200);
        res.send([]);
    }
}

const getRoomColor = async (id) => {
    const config = {
        "select": ["room/roomColor"],
        "from": Number(id)
    }

    let data = await axios.post(`${path.path}/query`, config).catch(err => {
        console.log("err from get room color: " + err.response)
        return;
    })

    return data.data[0]["room/roomColor"]
}



module.exports = {
    getByUserId,
    roomValidation,
    getAllRooms,
    getJoinedRoom,
    getRoomColor
}
