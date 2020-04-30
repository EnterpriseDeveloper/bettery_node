
const axios = require("axios");
const path = require("../config/path");


const registration = (req, res) => {

    let findNickName = {
        "select": ["*"],
        "from": ["users/nickName", req.body.nickName]
    }

    axios.post(path.path + "/query", findNickName).then((x) => {
        if (x.data.length === 0) {
            let data = [{
                "_id": "users$newUser",
                "nickName": req.body.nickName,
                "email": req.body.email,
                "wallet": req.body.wallet,
                "avatar": req.body.avatar,
                "fakeCoins": req.body.fakeCoins,
                "socialRegistration": req.body.socialRegistration
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

const setLoomWallet = (req, res) => {
    let data = [{
        "_id": Number(req.body.id),
        "loomWallet": req.body.loomWallet
    }]
    axios.post(path.path + "/transact", data).then(() => {
        res.status(200);
        res.send({ "transact": "done" })
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
            if (x.data.length != 0) {
                let o = userStructure(x)

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

const getUserById = (req, res) => {
    let conf = {
        "select": ["*", { "historyTransactions": ["*"] }],
        "from": Number(req.body.id)
    }

    axios.post(path.path + "/query", conf).then((x) => {
        if (x.data.length != 0) {
            let o = userStructure(x)

            res.status(200);
            res.send(o);

        } else {
            res.status(400);
            res.send("user do not exist");
        }
    }).catch((err) => {
        console.log(err)
        res.status(400);
        res.send(err);
    })
}

const allUsers = (req, res) => {

    let conf = {
        "select": ["*", { "historyTransactions": ["*"] }],
        "from": "users"
    }

    axios.post(path.path + "/query", conf).then((o) => {
        let result = o.data.map((x) => {
            return userStructure(x);
        })

        res.status(200);
        res.send(result);
    }).catch((err) => {
        res.status(400);
        res.send(err.response.data.message);
    })
}

const userStructure = (x) => {
    return {
        _id: x.data[0]["_id"],
        wallet: x.data[0]["users/wallet"],
        nickName: x.data[0]["users/nickName"],
        avatar: x.data[0]["users/avatar"],
        email: x.data[0]["users/email"],
        fakeCoins: x.data[0]["users/fakeCoins"],
        socialRegistration: x.data[0]["users/socialRegistration"] === undefined ? false : x.data[0]["users/socialRegistration"],
        historyTransaction: x.data[0]["historyTransactions"] === undefined ? [] : x.data[0]["historyTransactions"].map((history) => {
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
    }
}

module.exports = {
    registration,
    validate,
    allUsers,
    setLoomWallet,
    getUserById
}