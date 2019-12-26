const MongoClient = require('mongodb').MongoClient;
const keys = require("../key");
const _ = require("lodash");

const uri = keys.mongoKey;
const fromDB = "Quize";

const getAllActivites = async (req, res) => {
    let result = []
    let data = await fetchDataUserinvitations(req, res);
    for (let i = 0; i < data.length; i++) {
        let reserchPar = _.find(data[i].parcipiantAnswers, function (o) { return o.wallet === req.body.wallet; });
        if (reserchPar === undefined) {
            let reserchVal = _.find(data[i].validatorsAnswers, function (o) { return o.wallet === req.body.wallet; });
            if (reserchVal === undefined) {
                result.push(data[i]);
            }
        }
    }
    let x = _.filter(result, function(o) { return o.finalAnswers === null ; });
    let finish = _.orderBy(x, ['endTime'], ['asc']);

    res.status(200);
    res.send(finish);
}

const getCurrentEvent = async (req, res) => {
    let result = []
    let data = await fetchDataUserinvitations(req, res);
    for (let i = 0; i < data.length; i++) {
        let reserchPar = _.find(data[i].parcipiantAnswers, function (o) { return o.wallet === req.body.wallet; });
        if (reserchPar !== undefined) {
            result.push(data[i]);
        } else {
            let reserchVal = _.find(data[i].validatorsAnswers, function (o) { return o.wallet === req.body.wallet; });
            if (reserchVal !== undefined) {
                result.push(data[i]);
            }
        }
    }

    let x = _.filter(result, function(o) { return o.finalAnswers === null ; });
    let finish = _.orderBy(x, ['endTime'], ['asc']);

    res.status(200);
    res.send(finish);
}

const getPastEvent = async (req, res) => {
    let data = await fetchDataUserinvitations(req, res);
    let result = _.filter(data, function (o) { return o.finalAnswers !== null; });
    let finish = _.orderBy(result, ['endTime'], ['asc']);

    res.status(200);
    res.send(finish);
}


fetchDataUserinvitations = (req, res) => {
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
                if (result.listHostEvents.length !== 0) {
                    let active = await this.getActivites(result.listHostEvents, dbo, res, "Host");
                    active.forEach(element => {
                        activites.push(element)
                    });
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
    getAllActivites,
    getCurrentEvent,
    getPastEvent
}

