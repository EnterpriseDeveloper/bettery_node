const axios = require("axios");
const path = require("../../config/path");
const config = require("../../config/demoContractConfig")

const torusRegist = (req, res) => {

    let findEmail = {
        "select": ["*",
            { "users/historyTransactions": ["*"] },
            { "invites": ["*"] }
        ],
        "from": ["users/email", req.body.email]
    }

    axios.post(path.path + "/query", findEmail).then((x) => {
        if (x.data.length === 0) {
            let data = [{
                "_id": "users$newUser",
                "nickName": req.body.nickName,
                "email": req.body.email,
                "wallet": req.body.wallet,
                "avatar": req.body.avatar,
                "fakeCoins": config.fakeCoins,
                "verifier": req.body.verifier,
                "verifierId": req.body.verifierId
            }]

            axios.post(path.path + "/transact", data).then((x) => {
                res.status(200);
                res.send({
                    _id: x.data.tempids['users$newUser'],
                    nickName: req.body.nickName,
                    email: req.body.email,
                    wallet: req.body.wallet,
                    avatar: req.body.avatar,
                    fakeCoins: config.fakeCoins,
                    listHostEvents: [],
                    listParticipantEvents: [],
                    listValidatorEvents: [],
                    historyTransaction: [],
                    invitationList: [],
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
                fakeCoins: x.data[0]["users/fakeCoins"],
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
                }),
                invitationList: x.data[0]["invites"] === undefined ? [] : x.data[0]["invites"].map((invites) => {
                    return {
                        eventId: invites["invites/eventId"]["_id"],
                        role: invites["invites/role"],
                        status: invites["status"]
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