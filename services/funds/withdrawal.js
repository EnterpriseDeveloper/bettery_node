const axios = require("axios");
const path = require("../../config/path");
const contract = require('../../contract-services/contract');
const _ = require("lodash");

const setInitWithd = (req, res) => {
    let data = [{
        "_id": "withdrawal$newWithdrawal",
        "userId": req.body.userId,
        "date": Math.floor(Date.now() / 1000),
        "transactionHash": req.body.transactionHash,
        "status": "pending",
        "amount": req.body.amount,
        "coinType": req.body.coinType,
        "sign": req.body.sign
    }]
    axios.post(path.path + "/transact", data).then(() => {
        res.status(200);
        res.send({ "status": "done" })
    }).catch((err) => {
        res.status(400);
        res.send(err.response.data.message);
    })
}

const runBotWithdrawal = async () => {
    let dateNow = Math.floor(Date.now() / 1000);
    let pendingTime = 1800;
    let data = {
        "select": ["*"],
        "from": "withdrawal"
    }
    let withdrawalData = await axios.post(path.path + "/query", data).then((x) => {
        return x.data;
    }).catch((err) => {
        console.log(err)
    })

    if (withdrawalData || withdrawalData.length > 0) {
        console.log(dateNow);
        let findPending = _.filter(withdrawalData, function (o) { return o['withdrawal/status'] == 'pending'; });
        for (let i = 0; i < findPending.length; i++) {
            let startTime = findPending[i]['withdrawal/date'] + pendingTime
            if (dateNow > startTime) {
                console.log(findPending[i])
                let exitHash = findPending[i]['withdrawal/transactionHash']
                let contr = new contract.Contract();
                let test = await contr.makeExitProcess(exitHash)
                console.log(test);

            }
        }
    }
}

module.exports = {
    setInitWithd,
    runBotWithdrawal
}