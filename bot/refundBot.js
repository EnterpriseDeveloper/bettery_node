const axios = require("axios");
const url = require("../config/path");
const _ = require("lodash")
const epochWeek = require('../config/limits');
const Contract = require("../contract-services/contract");


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
        let events = _.filter(data.data, (x) => { return x['publicEvents/finalAnswerNumber'] == undefined && x['publicEvents/status'] != "reverted" })
        if (events.length != 0) {
            for (let i = 0; i < events.length; i++) {
                let eventId = events[i]["_id"]
                let endTime = events[i]["publicEvents/endTime"];
                let timeNow = Math.floor(new Date().getTime() / 1000.0)
                let week = epochWeek.epochWeek;
                if (timeNow - endTime > week) {
                    let participant = events[i]["publicEvents/parcipiantsAnswer"];
                    await revertEvent(eventId, participant)
                };
            }
        }
    }
}

const revertEvent = async (eventId, participant) => {
    let revert = [{
        "_id": eventId,
        "status": "reverted",
        "eventEnd": Math.floor(new Date().getTime() / 1000.0)
    }]

    await axios.post(`${url.path}/transact`, revert).catch((err) => {
        console.log(err);
        return;
    })

    if (participant !== undefined) {
        // ADD providers for main network
        let contr = new Contract.Contract();
        let getContract = await contr.loadContract();
        let from = contr.getAccount();
        try {
            const gasEstimate = await getContract.methods.revertedPayment(eventId, "do not have enough validators").estimateGas({ from: from });
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