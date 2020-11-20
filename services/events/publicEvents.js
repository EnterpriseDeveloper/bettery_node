const axios = require("axios");
const path = require("../../config/path");
const invites = require("./invites");
const _ = require("lodash");
const createRoom = require('../rooms/createRoom');

const createId = (req, res) => {
    let data = {
        _id: "publicEvents$newEvents",
        finalAnswer: ''
    }
    axios.post(path.path + "/transact", [data]).then((x) => {
        res.status(200);
        res.send({ "_id": x.data.tempids['publicEvents$newEvents'] })
    }).catch((err) => {
        res.status(400);
        res.send(err.response.data.message);
    })
}

const setQuestion = (req, res) => {
    let allData = req.body
    let hashtagsId = req.body.hashtagsId
    delete allData['getCoinsForHold'];
    delete allData['finalAnswers'];
    allData.invites = []
    let data = []

    // add room
    if (req.body.whichRoom == "new") {
        let room = createRoom.createRoom(allData, "publicEventsId");
        allData.room = [room._id]
        delete allData.roomName;
        delete allData.roomColor;
        delete allData.whichRoom;
        delete allData.roomId;
        data.push(room);
    } else {
        allData.room = [Number(allData.roomId)]
        delete allData.roomName;
        delete allData.roomColor;
        delete allData.whichRoom;
        delete allData.roomId;
    }

    // ADD Hashtags
    if (allData.hashtags.length !== 0) {
        data.push({
            _id: hashtagsId,
            hashtags: allData.hashtags
        })
        delete allData['hashtagsId'];
    } else {
        delete allData['hashtagsId'];
    }

    if (allData.parcipiant.length !== 0) {
        // create obj for Parcipiant
        let parc = invites.inviteUsers(allData.parcipiant, allData, "Participant")

        parc.forEach((x) => {
            data.push(x)
        })

        // add to users table
        allData.parcipiant.forEach((x, i) => {
            data.push({
                _id: x,
                invites: ["invites$par" + i]
            })
        })

        // add to event table
        parc.forEach((x) => {
            allData.invites.push(x._id)
        })

        delete allData['parcipiant'];

    } else {
        delete allData['parcipiant'];
    }

    if (allData.validators.length !== 0) {
        // create obj for Validate
        let valid = invites.inviteUsers(allData.validators, allData, "Validate")

        valid.forEach((x) => {
            data.push(x)
        })

        // add to users table
        allData.validators.forEach((x, i) => {
            data.push({
                _id: x,
                invites: ["invites$valid" + i]
            })
        })

        // add to event table
        valid.forEach((x) => {
            allData.invites.push(x._id)
        })

        delete allData['validators'];

    } else {
        delete allData['validators'];
    }

    data.push(allData)

    axios.post(path.path + "/transact", data).then((x) => {

        // ADD to host
        let hostData = [{
            _id: allData.host,
            hostPublicEvents: [allData._id],
        }]

        axios.post(path.path + "/transact", hostData).then(() => {
            res.status(200).send();
        }).catch((err) => {
            console.log("DB error: " + err.response.data.message)
            res.status(400);
            res.send(err.response.data.message);
        })

    }).catch((err) => {
        console.log("DB error: " + err.response.data.message)
        res.status(400);
        res.send(err.response.data.message);
    })

}

const getById = (req, res) => {
    let id = Number(req.body.id);

    let conf = {
        "select": ["*",
            { 'publicEvents/parcipiantsAnswer': ["*", { "publicActivites/from": ["*"] }] },
            { 'publicEvents/validatorsAnswer': ["*", { "publicActivites/from": ["*"] }] },
            { 'publicEvents/host': ["*"] },
            { 'publicEvents/room': ["*"] }
        ],
        "from": id
    }

    axios.post(path.path + "/query", conf).then((x) => {
        if (x.data.length !== 0) {
            let obj = eventStructure([x.data[0]])
            res.status(200)
            res.send(obj[0])
        } else {
            res.status(404);
            res.send({ message: "event not found" });
        }

    }).catch((err) => {
        res.status(400);
        res.send(err.response.data.message);
        console.log("DB error: " + err.response.data.message)
    })

}

const getAll = (req, res) => {

    let conf = {
        "select": ["*",
            { 'publicEvents/parcipiantsAnswer': ["*", { "publicActivites/from": ["*"] }] },
            { 'publicEvents/validatorsAnswer': ["*", { "publicActivites/from": ["*"] }] },
            { 'publicEvents/host': ["*"] },
            { 'publicEvents/room': ["*"] }
        ],
        "from": "publicEvents"
    }

    axios.post(path.path + "/query", conf).then((x) => {
        let obj = eventStructure(x.data)
        let allData = _.filter(obj, (o) => { return o.private === false })
        res.status(200)
        res.send(allData)
    }).catch((err) => {
        res.status(400);
        res.send(err.response.data.message);
        console.log("DB error: " + err.response.data.message)
    })
}

function eventStructure(data) {
    return data.map((z) => {
        return {
            answerAmount: z['publicEvents/answerAmount'],
            startTime: z['publicEvents/startTime'],
            id: z._id,
            hashtags: z['publicEvents/hashtags'],
            host: {
                id: z['publicEvents/host']["_id"],
                nickName: z['publicEvents/host']['users/nickName'],
                avatat: z['publicEvents/host']['users/avatar'],
                wallet: z['publicEvents/host']['users/wallet']
            },
            validated: z['publicEvents/validated'],
            status: z['publicEvents/status'],
            answers: z['publicEvents/answers'],
            money: z['publicEvents/money'],
            finalAnswer: z['publicEvents/finalAnswerNumber'] === undefined ? null : z['publicEvents/finalAnswerNumber'],
            validatorsAmount: z['publicEvents/validatorsAmount'],
            endTime: z['publicEvents/endTime'],
            transactionHash: z['publicEvents/transactionHash'],
            showDistribution: z['publicEvents/showDistribution'],
            question: z['publicEvents/question'],
            currencyType: z['publicEvents/currencyType'] === undefined ? false : z['publicEvents/currencyType'],
            private: z['publicEvents/private'] === undefined ? false : z['publicEvents/private'],
            reverted: z['publicEvents/reverted'] === undefined ? false : z['publicEvents/reverted'],
            multiChoise: z['publicEvents/multiChoise'] === undefined ? false : z['publicEvents/multiChoise'],
            parcipiantAnswers: z["publicEvents/parcipiantsAnswer"] === undefined ? undefined : z["publicEvents/parcipiantsAnswer"].map((par) => {
                return {
                    transactionHash: par['publicActivites/transactionHash'],
                    date: par['publicActivites/date'],
                    answer: par['publicActivites/answer'],
                    userId: par['publicActivites/from']['_id'],
                    amount: par['publicActivites/amount'],
                    avatar: par['publicActivites/from']['users/avatar'],
                }
            }),
            validatorsAnswers: z["publicEvents/validatorsAnswer"] === undefined ? undefined : z["publicEvents/validatorsAnswer"].map((val) => {
                return {
                    transactionHash: val['publicActivites/transactionHash'],
                    date: val['publicActivites/date'],
                    answer: val['publicActivites/answer'],
                    userId: val['publicActivites/from']['_id'],
                    avatar: val['publicActivites/from']['users/avatar'],
                }
            }),
            room: {
                name: z['publicEvents/room'][0]['room/name'],
                color: z['publicEvents/room'][0]['room/color'],
                owner: z['publicEvents/room'][0]['room/owner']['_id']
            }
        }
    })
}

const getBetteryEvent = async (req, res) => {
    let email = req.body.email
    if (email == undefined) {
        res.status(400);
        res.send("email is undefined");
    } else {
        let userInfo = {
            "select": ["_id"],
            "where": `users/email = \"${email}\"`
        }
        let getUserInfo = await axios.post(path.path + "/query", userInfo).catch((err) => {
            res.status(400);
            res.send(err.response.data);
            return
        })
        if (getUserInfo) {
            let id = getUserInfo.data[0]._id;
            let conf = {
                "select": ["publicEvents/question", "_id", "publicEvents/startTime"],
                "where": `publicEvents/host = ${id}`
            }
            let data = await axios.post(path.path + "/query", conf).catch((err) => {
                res.status(400);
                res.send(err.response.data);
                return
            })
            if (data) {
                let sortByTime = _.sortBy(data.data, [function (o) { return o["publicEvents/startTime"]; }]);
                let getLast = sortByTime.slice(Math.max(sortByTime.length - 5, 0))
                res.status(200);
                res.send(getLast);
            }
        }
    }
}

module.exports = {
    setQuestion,
    getById,
    getAll,
    createId,
    getBetteryEvent
}