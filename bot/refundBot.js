const axios = require("axios");
const url = require("../config/path");
const _ = require("lodash")
const epochWeek = require('../config/limits');
const contractInit = require("../contract-services/contractInit");
const MPContr = require("../contract-services/abi/MiddlePayment.json");

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
                    await revertEvent(eventId, participant, week)
                };
            }
        }
    }
}

const revertEvent = async (eventId, participant, week) => {
    let revert = [{
        "_id": eventId,
        "status": "reverted: Do not have enough validators by time - " + week,
        "eventEnd": Math.floor(new Date().getTime() / 1000.0)
    }]

    await axios.post(`${url.path}/transact`, revert).catch((err) => {
        console.log(err);
        return;
    })

    if (participant !== undefined) {
        // TODO add prodaction 
        let path = "test" // process.env.NODE_ENV
        let betteryContract = await contractInit.init(path, MPContr)
        try {
            const gasEstimate = await betteryContract.methods.revertedPayment(eventId, "do not have enough validators").estimateGas();
            await getContract.methods.revertedPayment(eventId, "do not have enough validators").send({
                gas: gasEstimate,
                gasPrice: 0
            });
        } catch (err) {
            console.log("error from refund Bot")
            console.log(err)
        }
    }
}

module.exports = {
    refundBot,
    revertEvent
}