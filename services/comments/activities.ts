import axios from 'axios';
import { path } from "../../config/path";
import createComments from './createComments';

const iconActivities = async (msg: any) => {
    let eventId = msg.eventId
    let userId = msg.userId
    let commentId = msg.commentId
    let type = msg.type
    let eventType = await createComments.eventType(eventId);

    let findActivites = {
        "select": ["*"],
        "where": `commentsIconActivites/commentId = ${Number(commentId)}`
    }

    let activites = await axios.post(`${path}/query`, findActivites).catch(err => {
        console.log(err)
    })
    if (activites) {
        let findEvent = activites.data.findIndex((x: any) => { return x['commentsIconActivites/from']["_id"] == Number(userId) })
        if (findEvent !== -1) {
            if (activites.data[findEvent]['commentsIconActivites/type'] == type) {
                let deleteEvent = [{
                    "_id": activites.data[findEvent]["_id"],
                    "_action": "delete"
                }]
                await axios.post(`${path}/transact`, deleteEvent).catch(err => {
                    console.log(err)
                })
            } else {
                let deleteEvent = [{
                    "_id": activites.data[findEvent]["_id"],
                    "_action": "delete"
                }]
                await axios.post(`${path}/transact`, deleteEvent).catch(err => {
                    console.log(err)
                })
                await createNewActivites(eventId, userId, type, commentId, eventType)
            }

        } else {
            await createNewActivites(eventId, userId, type, commentId, eventType)
        }
    }
}

const createNewActivites = async (eventId: any, userId: any, type: any, commentId: any, eventType: any) => {
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
    await axios.post(`${path}/transact`, data).catch(err => {
        console.log(err)
    })
}

export {
    iconActivities,
}