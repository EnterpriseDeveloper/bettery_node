const axios = require("axios");
const path = require("../../config/path");
const invites = require("./invites");
const _ = require("lodash");

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
            hostEvents: [allData._id],
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
            { 'publicEvents/parcipiantsAnswer': ["*", { "activites/from": ["_id"] }] },
            { 'publicEvents/validatorsAnswer': ["*", { "activites/from": ["_id"] }] }
        ],
        "from": id
    }

    axios.post(path.path + "/query", conf).then((x) => {
        let obj = eventStructure([x.data[0]])
        res.status(200)
        res.send(obj[0])
    }).catch((err) => {
        res.status(400);
        res.send(err.response.data.message);
        console.log("DB error: " + err.response.data.message)
    })

}

const getAll = (req, res) => {

    let conf = {
        "select": ["*",
            { 'publicEvents/parcipiantsAnswer': ["*", { "activites/from": ["_id"] }] },
            { 'publicEvents/validatorsAnswer': ["*", { "activites/from": ["_id"] }] }
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
            host: z['publicEvents/host']["_id"],
            validated: z['publicEvents/validated'],
            status: z['publicEvents/status'],
            answers: Object.assign([], z['publicEvents/answers']).reverse(),
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
                    transactionHash: par['activites/transactionHash'],
                    date: par['activites/date'],
                    answer: par['activites/answer'],
                    userId: par['activites/from']['_id']
                }
            }),
            validatorsAnswers: z["publicEvents/validatorsAnswer"] === undefined ? undefined : z["publicEvents/validatorsAnswer"].map((val) => {
                return {
                    transactionHash: val['activites/transactionHash'],
                    date: val['activites/date'],
                    answer: val['activites/answer'],
                    userId: val['activites/from']['_id']
                }
            }),
        }
    })
}

module.exports = {
    setQuestion,
    getById,
    getAll,
    createId
}