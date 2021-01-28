const axios = require('axios');
const path = require("../../config/path");

const createRoom = (data, type) => {
    return newRoom = {
        _id: "room$newRoom",
        [type]: [data._id],
        name: data.roomName,
        image: data.roomImage,
        color: data.roomColor,
        owner: data.host
    }
}

const joinToRoom = async (req, res) => {
    let userId = req.body.userId;
    let roomId = req.body.roomId;
    let config = [{
        '_id': "joinRoom$newJoin",
        "date": Math.floor(Date.now() / 1000),
        "notifications": true,
        "userId": Number(userId),
        "roomId": Number(roomId)
    }, {
        "_id": Number(userId),
        "joinedRooms": ["joinRoom$newJoin"]
    }, {
        "_id": Number(roomId),
        "joinedUsers": ["joinRoom$newJoin"]
    }]
    await axios.post(`${path.path}/transact`, config).catch((err) => {
        res.status(400);
        res.send(err.response.data.message);
        console.log("DB error: " + err.response.data.message)
        return;
    })

    res.status(200);
    res.send({ status: "ok" });
}

const leaveRoom = async (req, res) => {
    let joinedId = req.body.joinedId;
    let config = [{
        "_id": Number(joinedId),
        "_action": "delete"
    }]

    await axios.post(`${path.path}/transact`, config).catch((err) => {
        res.status(400);
        res.send(err.response.data.message);
        console.log("DB error: " + err.response.data.message)
        return;
    })

    res.status(200);
    res.send({ status: "deleted" });
}


module.exports = {
    createRoom,
    joinToRoom,
    leaveRoom
}