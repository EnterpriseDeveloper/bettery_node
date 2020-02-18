const MongoClient = require('mongodb').MongoClient;
const keys = require("../key");
const _ = require("lodash");

const uri = keys.mongoKey;
const fromDB = "Quize";

const axios = require("axios");
const path = require("../config/path");

const getHostEvent = async (req, res) => {
    let data = await fetchDataUserinvitations(req, res, true);
    let x = _.filter(data, function (o) { return o.hostWallet === req.body.wallet; });
    res.status(200);
    res.send(x);

}

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
                        { 'invites/eventId': ["*", { "events/host": ["users/wallet"] }] },
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
                                finalAnswer: inv['invites/eventId']['events/finalAnswer'] === '' ? null : inv['invites/eventId']['events/finalAnswer'],
                                validatorsAmount: inv['invites/eventId']['events/validatorsAmount'],
                                endTime: inv['invites/eventId']['events/endTime'],
                                transactionHash: inv['invites/eventId']['events/transactionHash'],
                                showDistribution: inv['invites/eventId']['events/showDistribution'],
                                question: inv['invites/eventId']['events/question'],
                                private: inv['invites/eventId']['events/private'] === undefined ? false : inv['invites/eventId']['events/private'],
                                multiChoise: inv['invites/eventId']['events/multiChoise'] === undefined ? false : inv['invites/eventId']['events/multiChoise']
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
    let result = []
    let data = await fetchData(req, res);
    for (let i = 0; i < data.length; i++) {

        if (data[i].hostWallet === req.body.wallet) {
            let reserchPar = _.find(data[i].parcipiantAnswers, function (o) { return o.wallet === req.body.wallet; });
            if (reserchPar !== undefined) {
                data[i].from = "Participant";
                data[i].host = true
                result.push(data[i]);
            } else {
                data[i].from = "none";
                data[i].host = true
                result.push(data[i]);
            }
        } else {
            let reserchPar = _.find(data[i].parcipiantAnswers, function (o) { return o.wallet === req.body.wallet; });
            if (reserchPar !== undefined) {
                data[i].from = "Participant";
                data[i].host = false;
                result.push(data[i]);
            } else {
                let reserchVal = _.find(data[i].validatorsAnswers, function (o) { return o.wallet === req.body.wallet; });
                if (reserchVal !== undefined) {
                    data[i].from = "Validator";
                    data[i].host = false;
                    result.push(data[i]);
                }
            }
        }
    }

    let x = _.filter(result, function (o) { return o.finalAnswers === null; });
    let finish = _.orderBy(x, ['endTime'], ['desc']);

    res.status(200);
    res.send(finish);
}

const getPastEvent = async (req, res) => {
    let result = [];
    let data = await fetchData(req, res);

    for (let i = 0; i < data.length; i++) {
        if (data[i].hostWallet === req.body.wallet) {
            let reserchPar = _.find(data[i].parcipiantAnswers, function (o) { return o.wallet === req.body.wallet; });
            if (reserchPar !== undefined) {
                data[i].from = "Participant";
                data[i].host = true
                result.push(data[i]);
            } else {
                data[i].from = "none";
                data[i].host = true
                result.push(data[i]);
            }
        } else {
            let reserchPar = _.find(data[i].parcipiantAnswers, function (o) { return o.wallet === req.body.wallet; });
            if (reserchPar !== undefined) {
                data[i].from = "Participant";
                data[i].host = false;
                result.push(data[i]);
            } else {
                let reserchVal = _.find(data[i].validatorsAnswers, function (o) { return o.wallet === req.body.wallet; });
                if (reserchVal !== undefined) {
                    data[i].from = "Validator";
                    data[i].host = false;
                    result.push(data[i]);
                }
            }
        }
    }

    let x = _.filter(result, function (o) { return o.finalAnswers !== null; });
    let finish = _.orderBy(x, ['endTime'], ['desc']);

    res.status(200);
    res.send(finish);
}

fetchData = () => {
    return new Promise((resolve) => {
        MongoClient.connect(uri, {
            useNewUrlParser: true,
            useUnifiedTopology: true
        }, function (err, db) {
            if (err) {
                res.status(400);
                res.send("error database connection");
                console.log("DB error: " + err)
            }
            let dbo = db.db(fromDB);
            dbo.collection("questions").find({}).toArray((err, result) => {
                if (err) {
                    res.status(400);
                    res.send("error database connection");
                    console.log("DB error: " + err)
                }
                resolve(result);
                db.close();
            });
        });
    })
}



fetchDataUserinvitations = (req, res, from) => {
    return new Promise((resolve) => {
        MongoClient.connect(uri, {
            useNewUrlParser: true,
            useUnifiedTopology: true
        }, function (err, db) {
            if (err) {
                res.status(400);
                res.send("error database connection");
                console.log("DB error: " + err)
            }
            let dbo = db.db(fromDB);
            let activites = [];

            dbo.collection("users").findOne({ wallet: req.body.wallet }, async (err, result) => {
                if (err) {
                    res.status(400);
                    res.send("error database connection");
                    console.log("DB error: " + err)
                }
                if (from === true) {
                    if (result.listHostEvents.length !== 0) {
                        let active = await this.getActivites(result.listHostEvents, dbo, res, "Host");
                        active.forEach(element => {
                            activites.push(element)
                        });
                    }
                }
                if (result.listParticipantEvents.length !== 0) {
                    let active = await this.getActivites(result.listParticipantEvents, dbo, res, "Participant");
                    active.forEach(element => {
                        activites.push(element)
                    });
                }
                if (result.listValidatorEvents.length !== 0) {
                    let active = await this.getActivites(result.listValidatorEvents, dbo, res, "Validator");
                    active.forEach(element => {
                        activites.push(element)
                    });
                }

                resolve(activites)
                db.close();

            })
        })

    })
}

getActivites = (data, dbo, res, from) => {
    let id = data.map((x) => {
        return x.event
    })
    return new Promise(resolve => {
        dbo.collection('questions').find({ "id": { "$in": id } }).toArray((err, result) => {
            if (err) {
                res.status(400);
                res.send("error database connection");
                console.log("DB error: " + err)
            }

            for (i in result) {
                result[i].from = from;
            }

            resolve(result)
        })
    })
}

module.exports = {
    getAllInvites,
    getCurrentEvent,
    getPastEvent,
    getHostEvent
}

