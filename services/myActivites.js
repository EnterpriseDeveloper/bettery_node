const MongoClient = require('mongodb').MongoClient;
const keys = require("../key");
const _ = require("lodash");

const uri = keys.mongoKey;
const fromDB = "Quize";

const axios = require("axios");
const path = require("../config/path");

const getAllInvites = async (req, res) => {
    let wallet = req.body.wallet

    let conf = {
        "select": ["*"],
        "from": ["users/wallet", wallet]
    }

    axios.post(path.path + "/query", conf).then((x) => {
        let inviteData = x.data['users/invites']
        if (inviteData !== undefined) {
            if (inviteData.length !== 0) {
                let invites = inviteData.map((x) => {
                    return x._id
                })

                let allInvites = {
                    "select": ["*",
                        {
                            'invites/eventId': ["*",
                                { "events/host": ["users/wallet"] },
                                { 'events/parcipiantsAnswer': ["*", { "activites/from": ["users/wallet"] }] },
                                { 'events/validatorsAnswer': ["*", { "activites/from": ["users/wallet"] }] }
                            ]
                        },
                        { 'invites/from': ["users/nickName"] }
                    ],
                    "from": invites
                }

                axios.post(path.path + "/query", allInvites).then((allInv) => {
                    let invitesQuery = allInv.data.map((inv) => {
                        return {
                            id: inv._id,
                            event: {
                                answerAmount: inv['invites/eventId']['events/answerAmount'],
                                startTime: inv['invites/eventId']['events/startTime'],
                                id: inv['invites/eventId']._id,
                                host: inv['invites/eventId']['events/host']["users/wallet"],
                                validated: inv['invites/eventId']['events/validated'],
                                status: inv['invites/eventId']['events/status'],
                                answers: Object.assign([], inv['invites/eventId']['events/answers']).reverse(),
                                money: inv['invites/eventId']['events/money'],
                                finalAnswer: inv['invites/eventId']['events/finalAnswerNumber'] === undefined ? null : inv['invites/eventId']['events/finalAnswerNumber'],
                                validatorsAmount: inv['invites/eventId']['events/validatorsAmount'],
                                endTime: inv['invites/eventId']['events/endTime'],
                                transactionHash: inv['invites/eventId']['events/transactionHash'],
                                showDistribution: inv['invites/eventId']['events/showDistribution'],
                                question: inv['invites/eventId']['events/question'],
                                private: inv['invites/eventId']['events/private'] === undefined ? false : inv['invites/eventId']['events/private'],
                                multiChoise: inv['invites/eventId']['events/multiChoise'] === undefined ? false : inv['invites/eventId']['events/multiChoise'],
                                parcipiantAnswers: inv['invites/eventId']["events/parcipiantsAnswer"] === undefined ? undefined : inv['invites/eventId']["events/parcipiantsAnswer"].map((par) => {
                                    return {
                                        transactionHash: par['activites/transactionHash'],
                                        date: par['activites/date'],
                                        answer: par['activites/answer'],
                                        wallet: par['activites/from']['users/wallet']
                                    }
                                }),
                                validatorsAnswers: inv['invites/eventId']["events/validatorsAnswer"] === undefined ? undefined : inv['invites/eventId']["events/validatorsAnswer"].map((val) => {
                                    return {
                                        transactionHash: val['activites/transactionHash'],
                                        date: val['activites/date'],
                                        answer: val['activites/answer'],
                                        wallet: val['activites/from']['users/wallet']
                                    }
                                }),
                            },

                            transactionHash: inv['invites/transactionHash'],
                            date: inv['invites/date'],
                            from: inv['invites/from'],
                            role: inv['invites/role'],
                            status: inv['invites/status']
                        }
                    })
                    res.status(200);
                    res.send(invitesQuery);

                }).catch((err) => {
                    console.log(err)
                    res.status(400);
                    res.send(err.response.data.message);
                })

            } else {
                res.status(200);
                res.send([]);
            }
        } else {
            res.status(200);
            res.send([]);
        }
    }).catch((err) => {
        res.status(400);
        res.send(err.response.data.message);
    })
}

const getCurrentEvent = async (req, res) => {
    let allData = await fetchData(req, res)
    let currentEvent = _.filter(allData, (e) => { return e.finalAnswer === null })

    res.status(200);
    res.send(currentEvent);
}

const getPastEvent = async (req, res) => {

    let allData = await fetchData(req, res)
    let pastEvent = _.filter(allData, (e) => { return e.finalAnswer !== null })

    res.status(200);
    res.send(pastEvent);
}

async function fetchData(req, res) {
    let allActivites = [];
    let id = req.body.id
    let config = {
        select: [
            {
                "users/activites": ["*", {
                    'activites/eventId': ["*",
                        { 'events/parcipiantsAnswer': ["*", { "activites/from": ["users/wallet"] }] },
                        { 'events/validatorsAnswer': ["*", { "activites/from": ["users/wallet"] }] }]
                }]
            },
            {
                "users/hostEvents": ["*",
                    { 'events/parcipiantsAnswer': ["*", { "activites/from": ["users/wallet"] }] },
                    { 'events/validatorsAnswer': ["*", { "activites/from": ["users/wallet"] }] }]
            }
        ],
        from: id
    }

    let allData = await axios.post(path.path + "/query", config).catch((err) => {
        console.log(err)
        res.status(400);
        res.send(err.response.data.message);
    })

    // get users activites
    if (allData.data['users/activites'] !== undefined) {
        allData.data['users/activites'].forEach((x) => {
            let userActivites = activitiesArchitecture([x['activites/eventId']], x['activites/role'], false)
            userActivites.forEach((o) => {
                allActivites.push(o)

            })
        })

    }

    // get host activites 
    if (allData.data['users/hostEvents'] !== undefined) {
        let hostActivites = activitiesArchitecture(allData.data['users/hostEvents'], 'none', true)
        hostActivites.forEach((o) => {
            allActivites.push(o)
        })

    }

    return allActivites
}

function activitiesArchitecture(data, from, host) {
    return data.map((z) => {
        return {
            answerAmount: z['events/answerAmount'],
            startTime: z['events/startTime'],
            id: z._id,
            from: from,
            host: host,
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
    getAllInvites,
    getCurrentEvent,
    getPastEvent
}

