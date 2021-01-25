const axios = require("axios");
const path = require("../../config/path");
const _ = require("lodash");
const structure = require('../../structure/event.struct');
const filterData = require('../../helpers/filter');
const additionalData = require('../../helpers/additionalData');


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
                                { 'publicEvents/parcipiantsAnswer': ["*", { "publicActivites/from": ["_id"] }] },
                                { 'publicEvents/validatorsAnswer': ["*", { "publicActivites/from": ["_id"] }] }
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
                                answerAmount: inv['invites/eventId']["publicEvents/parcipiantsAnswer"] === undefined ? 0 : inv['invites/eventId']["publicEvents/parcipiantsAnswer"].length,
                                startTime: inv['invites/eventId']['publicEvents/startTime'],
                                id: inv['invites/eventId']._id,
                                hashtags: inv['invites/eventId']['publicEvents/hashtags'],
                                host: inv['invites/eventId']['publicEvents/host']["_id"],
                                validated: inv['invites/eventId']['publicEvents/validated'],
                                status: inv['invites/eventId']['publicEvents/status'],
                                answers: Object.assign([], inv['invites/eventId']['publicEvents/answers']).reverse(),
                                money: inv['invites/eventId']['publicEvents/money'],
                                finalAnswer: inv['invites/eventId']['publicEvents/finalAnswerNumber'] === undefined ? null : inv['invites/eventId']['publicEvents/finalAnswerNumber'],
                                validatorsAmount: inv['invites/eventId']["publicEvents/validatorsAnswer"] === undefined ? 0 : inv['invites/eventId']["publicEvents/validatorsAnswer"].length,
                                eventEnd: inv['invites/eventId']['publicEvents/eventEnd'] === undefined ? 0 : inv['invites/eventId']['publicEvents/eventEnd'],
                                endTime: inv['invites/eventId']['publicEvents/endTime'],
                                transactionHash: inv['invites/eventId']['publicEvents/transactionHash'],
                                question: inv['invites/eventId']['publicEvents/question'],
                                currencyType: inv['invites/eventId']['publicEvents/currencyType'] === undefined ? false : inv['invites/eventId']['publicEvents/currencyType'],
                                parcipiantAnswers: inv['invites/eventId']["publicEvents/parcipiantsAnswer"] === undefined ? undefined : inv['invites/eventId']["publicEvents/parcipiantsAnswer"].map((par) => {
                                    return {
                                        transactionHash: par['publicActivites/transactionHash'],
                                        date: par['publicActivites/date'],
                                        answer: par['publicActivites/answer'],
                                        userId: par['publicActivites/from']['_id']
                                    }
                                }),
                                validatorsAnswers: inv['invites/eventId']["publicEvents/validatorsAnswer"] === undefined ? undefined : inv['invites/eventId']["publicEvents/validatorsAnswer"].map((val) => {
                                    return {
                                        transactionHash: val['publicActivites/transactionHash'],
                                        date: val['publicActivites/date'],
                                        answer: val['publicActivites/answer'],
                                        userId: val['publicActivites/from']['_id']
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

const getAllUserEvents = async (req, res) => {
    let eventData = [];
    let from = req.body.from;
    let to = req.body.to;
    let search = req.body.search != undefined ? req.body.search : '';
    let userId = req.body.userId;
    let finished = req.body.finished;

    let config = {
        select: [
            {
                "users/publicActivites": ["*", {
                    'publicActivites/eventId': ["*",
                        { 'publicEvents/parcipiantsAnswer': ["*", { "publicActivites/from": ["*"] }] },
                        { 'publicEvents/validatorsAnswer': ["*", { "publicActivites/from": ["*"] }] },
                        { 'publicEvents/host': ["*"] },
                        { 'publicEvents/room': ["*"] }]
                }]
            },
            {
                "users/hostPublicEvents": ["*",
                    { 'publicEvents/parcipiantsAnswer': ["*", { "publicActivites/from": ["*"] }] },
                    { 'publicEvents/validatorsAnswer': ["*", { "publicActivites/from": ["*"] }] },
                    { 'publicEvents/host': ["*"] },
                    { 'publicEvents/room': ["*"] }]
            }
        ],
        from: userId
    }

    let allData = await axios.post(path.path + "/query", config).catch((err) => {
        console.log(err)
        res.status(400);
        res.send(err.response.data.message);
    })
    let data = allData.data[0];
    if (data['users/publicActivites'] == undefined && data['users/hostPublicEvents'] == undefined) {
        res.status(200);
        res.send({
            allAmountEvents: 0,
            amount: 0,
            events: []
        });
    } else {
        if (data['users/publicActivites'] != undefined) {
            data['users/publicActivites'].forEach((x) => {
                eventData.push(x['publicActivites/eventId']);
            })
        }
        if (data['users/hostPublicEvents'] != undefined) {
            data['users/hostPublicEvents'].forEach((x) => {
                eventData.push(x);
            })
        }

        let unique = _.uniqBy(eventData, "_id");
        let obj = structure.publicEventStructure(unique);
        let dataEvetns = search.length >= 1 ? filterData.searchData(obj, search) : obj;
        if (!finished) {
            dataEvetns = _.filter(dataEvetns, (e) => { return e.finalAnswer === null })
        }
        let events = {
            allAmountEvents: obj.length,
            amount: dataEvetns.length,
            events: await additionalData.getAdditionalData(dataEvetns.slice(from, to), res)
        }
        res.status(200)
        res.send(events)
    }
}


module.exports = {
    getAllInvites,
    getAllUserEvents
}

