const MongoClient = require('mongodb').MongoClient;
const keys = require("../key");
const hashtags = require("./hashtags");
const invites = require('./invites');

const uri = keys.mongoKey;
const fromDB = "Quize";

const axios = require("axios");
const path = require("../config/path");

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

    // ADD HASHtags
    // ADD to user HOST
    // ADD Invites

    if (allData.parcipiant.length !== 0) {
        let parc = allData.parcipiant
    }

    if (allData.validators.length !== 0) {
        let valid = allData.validators

    }

    let data = allData
    delete data['finalAnswers'];
    delete data['parcipiant'];
    delete data['validators'];

    console.log(data);

    axios.post(path.path + "/transact", [data]).then((x) => {

        console.log(x)
        res.status(200).send();
    }).catch((err) => {
        console.log("DB error: " + err.response.data.message)
        res.status(400);
        res.send(err.response.data.message);
    })



    //   invites.addToHost(req.body, res, dbo)

    // add new hashtags
    //  if (req.body.hashtags.length !== 0) {
    //      hashtags.updateHashtags(req.body.hashtags, res, dbo)
    //  }

    // invite parcipiant
    //  if (req.body.parcipiant.length !== 0) {
    //      invites.inviteParcipiant(req.body, res, dbo)
    //  }

    // invite validators
    //  if (req.body.validators.length !== 0) {
    //      invites.inviteValidators(req.body, res, dbo)
    //  }

}

const getById = (req, res) => {
    let id = Number(req.body.id);

    let conf = {
        "select": ["*"],
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

    let conf = {
        "select": ["*"],
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
            // Host is object, maybe need rebuid structure
            host: z['events/host'],
            validated: z['events/validated'],
            status: z['events/status'],
            answers: Object.assign([], z['events/answers']).reverse(),
            money: z['events/money'],
            finalAnswer: z['events/finalAnswer'] === '' ? null : z['events/finalAnswer'],
            validatorsAmount: z['events/validatorsAmount'],
            endTime: z['events/endTime'],
            transactionHash: z['events/transactionHash'],
            showDistribution: z['events/showDistribution'],
            question: z['events/question'],
            private: z['events/private'] === undefined ? false : z['events/private'],
            multiChoise: z['events/multiChoise'] === undefined ? false : z['events/multiChoise']
        }
    })
}

module.exports = {
    setQuestion,
    getById,
    getAll,
    createId
}