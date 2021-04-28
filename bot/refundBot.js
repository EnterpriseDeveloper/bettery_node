const axios = require("axios");
const url = require("../config/path");
const _ = require("lodash")
const epochWeek = require('../config/limits');
const revertEvent = require("../services/events/revert");


const refundBot = async () => {
    let config = {
        "select": ["*",
            { 'publicEvents/parcipiantsAnswer': ["*"] }
        ],
        "from": "publicEvents"
    }
    let data = await axios.post(`${url.path}/query`, config).catch((err) => {
        console.log(err);
        return;
    })

    if (data.data.length != 0) {
        let events = _.filter(data.data, (x) => { return x['publicEvents/finalAnswerNumber'] == undefined && !x['publicEvents/status'].includes("reverted")})
        if (events.length != 0) {
            for (let i = 0; i < events.length; i++) {
                let eventId = events[i]["_id"]
                let endTime = events[i]["publicEvents/endTime"];
                let timeNow = Math.floor(new Date().getTime() / 1000.0)
                let week = epochWeek.epochWeek;
                if (timeNow - endTime > week) {
                    let participant = events[i]["publicEvents/parcipiantsAnswer"];
                    await revertEvent.revertEvent(eventId, participant, "not enough experts")
                };
            }
        }
    }
}

module.exports = {
    refundBot
}