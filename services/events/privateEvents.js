const axios = require("axios");
const path = require("../../config/path");
const _ = require("lodash");

const createId = (req, res) => {
    let data = {
        _id: "privateEvents$newEvents",
        finalAnswer: ''
    }
    axios.post(path.path + "/transact", [data]).then((x) => {
        res.status(200);
        res.send({ "_id": x.data.tempids['privateEvents$newEvents'] })
    }).catch((err) => {
        res.status(400);
        res.send(err.response.data.message);
    })
}

const createPrivateEvent = async (req, res) => {
    let data = [];
    data.push(req.body);
    let responce = await axios.post(path.path + "/transact", data).catch((err) => {
        console.log("DB error: " + err.response.data.message)
        res.status(400);
        res.send(err.response.data.message);
    })

    if (responce) {
        res.status(200).send();
    }
}

module.exports = {
    createId,
    createPrivateEvent
}