const axios = require("axios");
const path = require("../config/path");
const _ = require("lodash");

const getAdditionalData = async (events, res) => {
    for (let i = 0; i < events.length; i++) {
        // get last comment
        let confComment = {
            "select": ["comments/comment", "comments/date"],
            "where": `comments/publicEventsId = ${Number(events[i].id)}`,
            "opts": {"orderBy": ["DESC", "comments/date"] }
        }
        let comments = await axios.post(path.path + "/query", confComment)
            .catch((err) => {
                res.status(400);
                res.send(err.response.data.message);
                console.log("DB error: " + err.response.data.message)
                return;
            })

        events[i].commentsAmount = comments.data.length
        if (comments.data.length != 0) {
            events[i].lastComment = comments.data[0]['comments/comment'];
        } else {
            events[i].lastComment = "null";
        }
        // get rooms event amount
        let confRoom = {
            "select": ["room/publicEventsId"],
            "from": events[i].room.id
        }
        let rooms = await axios.post(path.path + "/query", confRoom)
            .catch((err) => {
                res.status(400);
                res.send(err.response.data.message);
                console.log("DB error: " + err.response.data.message)
                return;
            })
        events[i].room.eventAmount = rooms.data[0]['room/publicEventsId'].length;
    }

    return events;
}

module.exports = {
    getAdditionalData
}