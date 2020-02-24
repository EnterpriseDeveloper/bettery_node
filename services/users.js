
const axios = require("axios");
const path = require("../config/path");


const registration = (req, res) => {

    let findNickName = {
        "select": ["*"],
        "from": ["users/nickName", req.body.nickName]
    }

    axios.post(path.path + "/query", findNickName).then((x) => {
        if (x.data === null) {
            let data = [{
                "_id": "users$newUser",
                "nickName": req.body.nickName,
                "email": req.body.email,
                "wallet": req.body.wallet,
                "avatar": req.body.avatar
            }]

            axios.post(path.path + "/transact", data).then((x) => {
                res.status(200);
                res.send({ "_id": x.data.tempids['users$newUser'] })
            }).catch((err) => {
                res.status(400);
                res.send(err.response.data.message);
            })

        } else {
            res.status(400);
            res.send("user already exist");
        }

    }).catch((err) => {
        res.status(400);
        res.send(err.response.data.message);
    })
}

const validate = (req, res) => {
    if (req.body.wallet !== undefined) {
        let conf = {
            "select": ["*", { "historyTransactions": ["*"] }],
            "from": ["users/wallet", req.body.wallet]
        }

        axios.post(path.path + "/query", conf).then((x) => {

            if (x.data !== null) {
                let o = {
                    _id: x.data["_id"],
                    wallet: x.data["users/wallet"],
                    nickName: x.data["users/nickName"],
                    avatar: x.data["users/avatar"],
                    email: x.data["users/email"],
                    historyTransaction: x.data["historyTransactions"].map((history) => {
                        return {
                            id: history._id,
                            date: history['historyTransactions/date'],
                            paymentWay: history['historyTransactions/paymentWay'],
                            amount: history['historyTransactions/amount'],
                            role: history['historyTransactions/role'],
                            eventId: history['historyTransactions/eventId'] === undefined ? "Deleted" : history['historyTransactions/eventId']["_id"]
                        }
                    })
                }

                res.status(200);
                res.send(o);

            } else {
                let data = {
                    nickName: undefined,
                    email: undefined,
                    wallet: undefined
                }

                res.status(200);
                res.send(data);
            }
        }).catch((err) => {
            console.log(err)
            res.status(400);
            res.send(err);
        })
    } else {
        res.status(400);
        res.send("reqest is undefined");
    }
}

const allUsers = (req, res) => {

    let conf = {
        "select": ["*", { "historyTransactions": ["*"] }],
        "from": "users"
    }

    axios.post(path.path + "/query", conf).then((o) => {
        let result = o.data.map((x) => {
            return {
                _id: x["_id"],
                wallet: x["users/wallet"],
                nickName: x["users/nickName"],
                avatar: x["users/avatar"],
                email: x["users/email"],
                historyTransaction: x["historyTransactions"].map((history) => {
                    return {
                        id: history._id,
                        date: history['historyTransactions/date'],
                        paymentWay: history['historyTransactions/paymentWay'],
                        amount: history['historyTransactions/amount'],
                        role: history['historyTransactions/role'],
                        eventId: history['historyTransactions/eventId'] === undefined ? "Deleted" : history['historyTransactions/eventId']["_id"]

                    }
                })
            }
        })
        res.status(200);
        res.send(result);
    }).catch((err) => {
        res.status(400);
        res.send(err.response.data.message);
    })
}

module.exports = {
    registration,
    validate,
    allUsers
}