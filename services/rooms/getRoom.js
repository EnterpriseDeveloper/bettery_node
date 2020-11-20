const axios = require('axios');
const path = require("../../config/path");
const _ = require('lodash');

const getByUserId = async (req, res) => {
    let userId = req.body.id
    let getRooms = {
        "select": ["*"],
        "where": `room/owner = ${Number(userId)}`
    }

    let rooms = await axios.post(`${path.path}/query`, getRooms).catch(err => {
        res.status(400);
        res.send(err.response.data.message);
        console.log("DB error: " + err.response.data.message)
    })
    if (rooms) {
        let obj = roomStruct(rooms.data)
        res.status(200)
        res.send(obj)
    }
}

const roomValidation = async (req, res) => {
    let roomName = req.body.name;
    let userId = req.body.userId
    let findRoom = {
        "select": ["*"],
        "where": `room/owner = ${Number(userId)}`
    }
    let rooms = await axios.post(`${path.path}/query`, findRoom).catch(err => {
        res.status(400);
        res.send(err.response.data.message);
        console.log("DB error: " + err.response.data.message)
    })
    if (rooms) {
        if (rooms.data.length !== 0) {
            let findUser = _.find(rooms.data, (x) => { return x['room/name'] == roomName })
            if(findUser !== undefined){
                res.status(400);
                res.send({ message: "room with this name already exist" })
            }else{
                res.status(200);
                res.send({ message: "ok" })
            }
        } else {
            res.status(200);
            res.send({ message: "ok" })
        }
    }
}

const roomStruct = (data) => {
    return data.map((z) => {
        return {
            id: z["_id"],
            onwer: z['room/owner']["_id"],
            name: z['room/name'],
            color: z['room/color'],
            privateEventsId: z['room/privateEventsId'] == undefined ? [] : z['room/privateEventsId'],
            publicEventsId: z['room/publicEventsId'] == undefined ? [] : z['room/publicEventsId']
        }
    })
}

module.exports = {
    getByUserId,
    roomValidation
}