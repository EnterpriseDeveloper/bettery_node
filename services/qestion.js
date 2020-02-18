const axios = require("axios");
const path = require("../config/path");
const invites = require("./invites");

const createId = (req, res) => {
    let data = {
        _id: "events$newEvents",
        finalAnswer: ''
    }
    axios.post(path.path + "/transact", [data]).then((x) => {
        res.status(200);
        res.send({ "_id": x.data.tempids['events$newEvents'] })
    }).catch((err) => {
        res.status(400);
        res.send(err.response.data.message);
    })

}

const setQuestion = (req, res) => {
    let allData = req.body
    delete allData['finalAnswers'];
    allData.invites = []
    let data = []

    // ADD HASHtags ////////////////////////////////

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
            hostEvents: [allData._id]
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

    // add new hashtags
    //  if (req.body.hashtags.length !== 0) {
    //      hashtags.updateHashtags(req.body.hashtags, res, dbo)
    //  }

}

const getById = (req, res) => {
    let id = Number(req.body.id);

    let conf = {
        "select": ["*",
            { 'events/host': ["users/wallet"] },
            { 'events/parcipiantsAnswer': ["*", { "activites/from": ["users/wallet"] }] },
            { 'events/validatorsAnswer': ["*", { "activites/from": ["users/wallet"] }] }
        ],
        "from": id
    }

    axios.post(path.path + "/query", conf).then((x) => {
        let obj = eventStructure([x.data])
        res.status(200)
        res.send(obj[0])
    }).catch((err) => {
        res.status(400);
        res.send(err.response.data.message);
        console.log("DB error: " + err.response.data.message)
    })

}

const getAll = (req, res) => {
    // get all but only public /////////////////////////////////

    let conf = {
        "select": ["*",
            { 'events/host': ["users/wallet"] },
            { 'events/parcipiantsAnswer': ["*", { "activites/from": ["users/wallet"] }] },
            { 'events/validatorsAnswer': ["*", { "activites/from": ["users/wallet"] }] }
        ],
        "from": "events"
    }

    axios.post(path.path + "/query", conf).then((x) => {
        let obj = eventStructure(x.data)
        res.status(200)
        res.send(obj)
    }).catch((err) => {
        res.status(400);
        res.send(err.response.data.message);
        console.log("DB error: " + err.response.data.message)
    })
}

function eventStructure(data) {
    return data.map((z) => {
        return {
            answerAmount: z['events/answerAmount'],
            startTime: z['events/startTime'],
            id: z._id,
            host: z['events/host']['users/wallet'],
            validated: z['events/validated'],
            status: z['events/status'],
            answers: Object.assign([], z['events/answers']).reverse(),
            money: z['events/money'],
            finalAnswer: z['events/finalAnswerNumber'] === undefined ? null : z['events/finalAnswerNumber'],
            validatorsAmount: z['events/validatorsAmount'],
            endTime: z['events/endTime'],
            transactionHash: z['events/transactionHash'],
            showDistribution: z['events/showDistribution'],
            question: z['events/question'],
            private: z['events/private'] === undefined ? false : z['events/private'],
            multiChoise: z['events/multiChoise'] === undefined ? false : z['events/multiChoise'],
            parcipiantAnswers: z["events/parcipiantsAnswer"] === undefined ? undefined : z["events/parcipiantsAnswer"].map((par) => {
                return {
                    transactionHash: par['activites/transactionHash'],
                    date: par['activites/date'],
                    answer: par['activites/answer'],
                    wallet: par['activites/from']['users/wallet']
                }
            }),
            validatorsAnswers: z["events/validatorsAnswer"] === undefined ? undefined : z["events/validatorsAnswer"].map((val) => {
                return {
                    transactionHash: val['activites/transactionHash'],
                    date: val['activites/date'],
                    answer: val['activites/answer'],
                    wallet: val['activites/from']['users/wallet']
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