const axios = require("axios");
const path = require("../../config/path");

const setInitWithd = (req, res) => {
    let data = [{
        "_id": "withdrawal$newWithdrawal",
        "userId": req.body.dataFromRedis.id,
        "date": Math.floor(Date.now() / 1000),
        "transactionHash": req.body.transactionHash,
        "status": "pending",
        "amount": req.body.amount
    }]
    axios.post(path.path + "/transact", data).then(() => {
        res.status(200);
        res.send({ "status": "done" })
    }).catch((err) => {
        res.status(400);
        res.send(err.response.data.message);
    })
}

const getWithdInfo = (req, res) => {
   // TODO
}

module.exports = {
    setInitWithd,
    getWithdInfo
}
