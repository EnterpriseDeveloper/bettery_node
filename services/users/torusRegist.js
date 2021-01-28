const axios = require("axios");
const path = require("../../config/path");
const betteryToken = require("../funds/betteryToken");

const torusRegist = (req, res) => {

    let wallet = req.body.wallet;

    let findEmail = {
        "select": ["*",
            { "users/historyTransactions": ["*"] }
        ],
        "from": ["users/email", req.body.email]
    }

    axios.post(path.path + "/query", findEmail).then((x) => {
        if (x.data.length === 0) {
            let data = [{
                "_id": "users$newUser",
                "nickName": req.body.nickName,
                "email": req.body.email,
                "wallet": wallet,
                "avatar": req.body.avatar,
                "verifier": req.body.verifier,
                "verifierId": req.body.verifierId
            }]

            axios.post(path.path + "/transact", data).then(async (x) => {
                await betteryToken.transferBetteryToken(wallet);
                res.status(200);
                res.send({
                    _id: x.data.tempids['users$newUser'],
                    nickName: req.body.nickName,
                    email: req.body.email,
                    wallet: req.body.wallet,
                    avatar: req.body.avatar,
                    listHostEvents: [],
                    listParticipantEvents: [],
                    listValidatorEvents: [],
                    historyTransaction: [],
                    verifier: req.body.verifier,
                })
            }).catch((err) => {
                res.status(400);
                res.send(err.response.data.message);
            })

        } else {
            res.status(200);
            res.send({
                _id: x.data[0]["_id"],
                nickName: x.data[0]["users/nickName"],
                email: x.data[0]["users/email"],
                wallet: x.data[0]["users/wallet"],
                avatar: x.data[0]["users/avatar"],
                verifier: x.data[0]["users/verifier"],
                listHostEvents: [],
                listParticipantEvents: [],
                listValidatorEvents: [],
                historyTransaction: x.data[0]["users/historyTransactions"] === undefined ? [] : x.data[0]["users/historyTransactions"].map((history) => {
                    return {
                        id: history._id,
                        date: history['historyTransactions/date'],
                        paymentWay: history['historyTransactions/paymentWay'],
                        amount: history['historyTransactions/amount'],
                        role: history['historyTransactions/role'],
                        currencyType: history['historyTransactions/currencyType'],
                        eventId: history['historyTransactions/eventId'] === undefined ? "Deleted" : history['historyTransactions/eventId']["_id"]
                    }
                })
            })
        }

    }).catch((err) => {
        res.status(400);
        res.send(err.response.data.message);
    })
}

module.exports = {
    torusRegist
}