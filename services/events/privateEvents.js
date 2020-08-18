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
    axios.post(path.path + "/transact", data).then(()=>{
         // ADD to host
         let hostData = [{
            _id: allData.host,
            hostPrivateEvents: [allData._id],
        }]

        axios.post(path.path + "/transact", hostData).then(() => {
            res.status(200).send();
        }).catch((err)=>{
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

module.exports = {
    createId,
    createPrivateEvent
}