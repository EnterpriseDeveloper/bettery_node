const axios = require("axios");
const url = require("../config/path");

const deleteEventBot = async () => {
    let configPub = {
        "select": ["*"],
        "from": "publicEvents"
    }
    let publicEvents = await axios.post(`${url.path}/query`, configPub).catch((err) => {
        console.log(err);
        return;
    })

    for (let i = 0; i < publicEvents.data; i++) {
        if (publicEvents.data[i]['publicEvents/startTime'] == undefined) {
            let eventId = publicEvents.data[i]["_id"];
            let dateCreation = publicEvents.data[i]["publicEvents/dateCreation"];
            let timeNow = Math.floor(new Date().getTime() / 1000.0)
            if (dateCreation - timeNow > 600) {
                await deleleEvent(eventId)
            }
        }
    }
}

const deleleEvent = async (eventId) => {
    let revert = [{
        "_id": eventId,
        "_action": "delete"
    }]

    await axios.post(`${url.path}/transact`, revert).catch((err) => {
        console.log(err);
        return;
    })
}

module.exports = {
    deleteEventBot
}