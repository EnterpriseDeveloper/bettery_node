const axios = require("axios");
const path = require("../../config/path");

const createComment = async (msg) => {
    if (msg.eventId !== undefined || msg.userId !== undefined || msg.comment !== undefined) {
        let type = await eventType(msg.eventId);

        let comments = [{
            _id: "comments$newComment",
            from: msg.userId,
            date: Math.floor(Date.now() / 1000),
            comment: msg.comment,
            [type]: msg.eventId
        }]
        await axios.post(`${path.path}/transact`, comments).catch(err => {
            console.log(err)
        })
    } else {
        console.log("structure data is incorrect from ");
    }
}

const eventType = async (id) => {
    let conf = {
        "select": ["*"],
        "from": Number(id)
    }
    let getEvent = await axios.post(`${path.path}/query`, conf).catch(err => {
        console.log(err)
    })
    if (getEvent) {
        if (getEvent.data.length !== 0) {
            let eventText = JSON.stringify(getEvent.data)
            let eventIndex = eventText.search("privateEvents");
            return eventIndex == -1 ? "publicEventsId" : "privateEventsId"
        } else {
            console.log("event is undefined");
        }
    }
}

module.exports = {
    createComment,
    eventType
}
