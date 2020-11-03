const axios = require('axios')
const path = require("../../config/path");
const createComments = require('./createComments');

const getAllCommentsById = async (msg) => {
    let eventType = await createComments.eventType(msg);

    let conf = {
        "select": ["*", { 'comments/from': ["users/nickName", "users/avatar"] }],
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
            comment: x['comments/comment'],
            date: x['comments/date'],
            user: {
                id: x['comments/from']._id,
                nickName: x['comments/from']['users/nickName'],
                avatar: x['comments/from']['users/avatar']
            }
        }
    })
}


module.exports = {
    getAllCommentsById
}