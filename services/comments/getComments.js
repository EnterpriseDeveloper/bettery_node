const axios = require('axios')
const path = require("../../config/path");
const createComments = require('./createComments');

const getAllCommentsById = async (msg) => {
    let eventType = await createComments.eventType(msg);

    let conf = {
        "select": ["*", {
            'comments/from': ["users/nickName", "users/avatar"],
            'comments/wink': ["*", {'commentsIconActivites/from': ["*"]}],
            'comments/angry': ["*", {'commentsIconActivites/from': ["*"]}],
            'comments/smile': ["*", {'commentsIconActivites/from': ["*"]}],
            'comments/star': ["*", {'commentsIconActivites/from': ["*"]}],
            'comments/reply': ["*", { 'comments/from': ["users/nickName", "users/avatar"] }]
        }],
        "where": `comments/${eventType} = ${Number(msg)}`
    }

    let getComments = await axios.post(`${path.path}/query`, conf).catch(err => {
        console.log(err)
    })
    if (getComments) {
        if (getComments.data.length != 0) {
            return commentsStructure(getComments.data)
        } else {
            return []
        }
    }
}

const commentsStructure = (comments) => {
    return comments.map((x) => {
        return {
            id: x['_id'],
            comment: x['comments/comment'],
            date: x['comments/date'],
            wink: x['comments/wink'] == undefined ? [] : activitesStructure(x['comments/wink']),
            angry: x['comments/angry'] == undefined ? [] : activitesStructure(x['comments/angry']),
            smile: x['comments/smile'] == undefined ? [] : activitesStructure(x['comments/smile']),
            star: x['comments/star'] == undefined ? [] : activitesStructure(x['comments/star']),
            user: {
                id: x['comments/from']._id,
                nickName: x['comments/from']['users/nickName'],
                avatar: x['comments/from']['users/avatar']
            },
            replies: x['comments/reply'] == undefined ? [] : commentsStructure(x['comments/reply']),
            activites:
                (x['comments/wink'] == undefined ? 0 : x['comments/wink'].length) +
                (x['comments/angry'] == undefined ? 0 : x['comments/angry'].length) +
                (x['comments/smile'] == undefined ? 0 : x['comments/smile'].length) +
                (x['comments/star'] == undefined ? 0 : x['comments/star'].length)
        }
    })
}

const activitesStructure = (x) => {
    return x.map((z) => {
        return {
            date: z['commentsIconActivites/date'],
            user: {
                id: z['commentsIconActivites/from']._id,
                nickName: z['commentsIconActivites/from']['users/nickName'],
                avatar: z['commentsIconActivites/from']['users/avatar']
            }
        }
    })
}


module.exports = {
    getAllCommentsById
}