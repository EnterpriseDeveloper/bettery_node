const axios = require('axios');
const path = require("../../config/path");
const createComments = require('./createComments');
const _ = require("lodash");

const iconActivities = async (msg) => {
    let eventId = msg.eventId
    let userId = msg.userId
    let commentId = msg.commentId
    let type = msg.type
    let eventType = await createComments.eventType(eventId);

    let findActivites = {
        "select": ["*"],
        "where": `commentsIconActivites/from = ${Number(userId)}`
    }

    let activites = await axios.post(`${path.path}/query`, findActivites).catch(err => {
        console.log(err)
    })
    if (activites) {
        let findEvent = _.findIndex(activites.data, (x) => { return x[`commentsIconActivites/${eventType}`]["_id"] == eventId })
        if (findEvent !== -1) {
            let deleteEvent = [{
                "_id": activites.data[findEvent]["_id"],
                "_action": "delete"
            }]
            await axios.post(`${path.path}/transact`, deleteEvent).catch(err => {
                console.log(err)
            })

            await createNewActivites(eventId, userId, type, commentId, eventType)

        } else {
            await createNewActivites(eventId, userId, type, commentId, eventType)
        }
    }
}

const createNewActivites = async (eventId, userId, type, commentId, eventType) => {
    let data = [{
        _id: "commentsIconActivites$newActivites",
        [eventType]: eventId,
        date: Math.floor(Date.now() / 1000),
        from: userId,
        type: type,
        commentId: commentId
    }, {
        _id: commentId,
        [type]: ["commentsIconActivites$newActivites"]
    }]
    await axios.post(`${path.path}/transact`, data).catch(err => {
        console.log(err)
    })
}

module.exports = {
    iconActivities,
}