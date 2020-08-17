const axios = require("axios");
const path = require("../../config/path");
const _ = require("lodash");


const getAllInvites = async (req, res) => {
    let id = req.body.id

    let conf = {
        "select": ["*"],
        "from": id
    }

    axios.post(path.path + "/query", conf).then((x) => {
        let inviteData = x.data[0]['users/invites']
        if (inviteData !== undefined) {
            if (inviteData.length !== 0) {
                let invites = inviteData.map((x) => {
                    return x._id
                })

                let allInvites = {
                    "select": ["*",
                        {
                            'invites/eventId': ["*",
                                { 'publicEvents/parcipiantsAnswer': ["*", { "activites/from": ["_id"] }] },
                                { 'publicEvents/validatorsAnswer': ["*", { "activites/from": ["_id"] }] }
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
                                answerAmount: inv['invites/eventId']['publicEvents/answerAmount'],
                                startTime: inv['invites/eventId']['publicEvents/startTime'],
                                id: inv['invites/eventId']._id,
                                hashtags: inv['invites/eventId']['publicEvents/hashtags'],
                                host: inv['invites/eventId']['publicEvents/host']["_id"],
                                validated: inv['invites/eventId']['publicEvents/validated'],
                                status: inv['invites/eventId']['publicEvents/status'],
                                answers: Object.assign([], inv['invites/eventId']['publicEvents/answers']).reverse(),
                                money: inv['invites/eventId']['publicEvents/money'],
                                finalAnswer: inv['invites/eventId']['publicEvents/finalAnswerNumber'] === undefined ? null : inv['invites/eventId']['publicEvents/finalAnswerNumber'],
                                validatorsAmount: inv['invites/eventId']['publicEvents/validatorsAmount'],
                                endTime: inv['invites/eventId']['publicEvents/endTime'],
                                transactionHash: inv['invites/eventId']['publicEvents/transactionHash'],
                                showDistribution: inv['invites/eventId']['publicEvents/showDistribution'],
                                question: inv['invites/eventId']['publicEvents/question'],
                                reverted: inv['invites/eventId']['publicEvents/reverted'] === undefined ? false : inv['invites/eventId']['publicEvents/reverted'],
                                currencyType: inv['invites/eventId']['publicEvents/currencyType'] === undefined ? false : inv['invites/eventId']['publicEvents/currencyType'],
                                private: inv['invites/eventId']['publicEvents/private'] === undefined ? false : inv['invites/eventId']['publicEvents/private'],
                                multiChoise: inv['invites/eventId']['publicEvents/multiChoise'] === undefined ? false : inv['invites/eventId']['publicEvents/multiChoise'],
                                parcipiantAnswers: inv['invites/eventId']["publicEvents/parcipiantsAnswer"] === undefined ? undefined : inv['invites/eventId']["publicEvents/parcipiantsAnswer"].map((par) => {
                                    return {
                                        transactionHash: par['activites/transactionHash'],
                                        date: par['activites/date'],
                                        answer: par['activites/answer'],
                                        userId: par['activites/from']['_id']
                                    }
                                }),
                                validatorsAnswers: inv['invites/eventId']["publicEvents/validatorsAnswer"] === undefined ? undefined : inv['invites/eventId']["publicEvents/validatorsAnswer"].map((val) => {
                                    return {
                                        transactionHash: val['activites/transactionHash'],
                                        date: val['activites/date'],
                                        answer: val['activites/answer'],
                                        userId: val['activites/from']['_id']
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

                    let allData = []

                    for (let i = 0; i < invitesQuery.length; i++) {
                        if (invitesQuery[i].event.parcipiantAnswers !== undefined) {
                            let findActivites = _.findIndex(invitesQuery[i].event.parcipiantAnswers, (o) => { return o.userId === id });
                            if (findActivites === -1) {
                                if (invitesQuery[i].event.validatorsAnswers !== undefined) {
                                    let findActivites = _.findIndex(invitesQuery[i].event.validatorsAnswers, (o) => { return o.userId === id });
                                    if (findActivites === -1) {
                                        allData.push(invitesQuery[i])
                                    }
                                } else {
                                    allData.push(invitesQuery[i])
                                }
                            }
                        } else {
                            if (invitesQuery[i].event.validatorsAnswers !== undefined) {
                                let findActivites = _.findIndex(invitesQuery[i].event.validatorsAnswers, (o) => { return o.userId === id });
                                if (findActivites === -1) {
                                    allData.push(invitesQuery[i])
                                }
                            } else {
                                allData.push(invitesQuery[i])
                            }
                        }
                    }

                    res.status(200);
                    res.send(allData);

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
                        { 'publicEvents/parcipiantsAnswer': ["*", { "activites/from": ["_id"] }] },
                        { 'publicEvents/validatorsAnswer': ["*", { "activites/from": ["_id"] }] }]
                }]
            },
            {
                "users/hostEvents": ["*",
                    { 'publicEvents/parcipiantsAnswer': ["*", { "activites/from": ["_id"] }] },
                    { 'publicEvents/validatorsAnswer': ["*", { "activites/from": ["_id"] }] }]
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
    if (allData.data[0]['users/activites'] !== undefined) {
        allData.data[0]['users/activites'].forEach((x) => {
            let userActivites = activitiesArchitecture([x['activites/eventId']], x['activites/role'], false)
            userActivites.forEach((o) => {
                allActivites.push(o)

            })
        })

    }

    // get host activites 
    if (allData.data[0]['users/hostEvents'] !== undefined) {
        let hostActivites = activitiesArchitecture(allData.data[0]['users/hostEvents'], 'none', true)
        hostActivites.forEach((o) => {
            allActivites.push(o)
        })

    }

    return allActivites
}

function activitiesArchitecture(data, from, host) {
    return data.map((z) => {
        return {
            answerAmount: z['publicEvents/answerAmount'],
            startTime: z['publicEvents/startTime'],
            id: z._id,
            from: from,
            host: host,
            validated: z['publicEvents/validated'],
            hashtags: z['publicEvents/hashtags'],
            status: z['publicEvents/status'],
            answers: Object.assign([], z['publicEvents/answers']).reverse(),
            money: z['publicEvents/money'],
            finalAnswer: z['publicEvents/finalAnswerNumber'] === undefined ? null : z['publicEvents/finalAnswerNumber'],
            validatorsAmount: z['publicEvents/validatorsAmount'],
            endTime: z['publicEvents/endTime'],
            transactionHash: z['publicEvents/transactionHash'],
            showDistribution: z['publicEvents/showDistribution'],
            question: z['publicEvents/question'],
            reverted: z['publicEvents/reverted'] === undefined ? false : z['publicEvents/reverted'],
            currencyType: z['publicEvents/currencyType'] === undefined ? false : z['publicEvents/currencyType'],
            private: z['publicEvents/private'] === undefined ? false : z['publicEvents/private'],
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
    getAllInvites,
    getCurrentEvent,
    getPastEvent
}

