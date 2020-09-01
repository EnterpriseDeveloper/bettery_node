const axios = require("axios");
const path = require("../../config/path");
const _ = require("lodash");

const createId = (req, res) => {
    let data = [{
        _id: "privateEvents$newEvents",
        finalAnswer: ''
    }]
    axios.post(path.path + "/transact", data).then((x) => {
        res.status(200);
        res.send({ "_id": x.data.tempids['privateEvents$newEvents'] })
    }).catch((err) => {
        res.status(400);
        res.send(err.response.data.message);
    })
}

const createPrivateEvent = async (req, res) => {
    let allData = req.body;
    let data = [];
    data.push(allData);
    axios.post(path.path + "/transact", data).then(() => {
        // ADD to host
        let hostData = [{
            _id: allData.host,
            hostPrivateEvents: [allData._id],
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
    if (!id) {
        res.status(400);
        res.send({ "error": "do not have id" });
    } else {
        let conf = {
            "select": ["*",
                { 'publicEvents/parcipiantsAnswer': ["*", { "publicActivites/from": ["_id"] }] },
            ],
            "from": id
        }

        axios.post(path.path + "/query", conf).then((x) => {
            if (x.data.length != 0) {
                let obj = eventStructure([x.data[0]])
                res.status(200)
                res.send(obj[0])
            } else {
                res.status(400);
                res.send({ "error": "id is incorect" });
            }
        }).catch((err) => {
            res.status(400);
            res.send(err.response.data.message);
            console.log("DB error: " + err.response.data.message)
        })
    }
}

function eventStructure(data) {
    return data.map((z) => {
        return {
            winner: z['privateEvents/winner'],
            startTime: z['privateEvents/startTime'],
            endTime: z['privateEvents/endTime'],
            transactionHash: z['privateEvents/transactionHash'],
            id: z._id,
            status: z['privateEvents/status'],
            question: z['privateEvents/question'],
            answers: z["privateEvents/answers"],
            host: z['privateEvents/host']["_id"],
            finalAnswer: z["privateEvents/finalAnswer"],
            parcipiantAnswers: z["privateEvents/parcipiantsAnswer"] === undefined ? undefined : z["privateEvents/parcipiantsAnswer"].map((par) => {
                return {
                    transactionHash: par['privateActivites/transactionHash'],
                    date: par['privateActivites/date'],
                    answer: par['privateActivites/answer'],
                    userId: par['privateActivites/from']['_id']
                }
            }),
        }
    })
}

module.exports = {
    createId,
    createPrivateEvent,
    getById
}