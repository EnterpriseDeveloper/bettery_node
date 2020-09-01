
const axios = require("axios");
const path = require("../../config/path");
const betteryToken = require("../funds/betteryToken");

const registration = async (req, res) => {

    let wallet = req.body.wallet

    let findEmail = {
        "select": ["*"],
        "from": ["users/email", req.body.email]
    }

    let validate = await axios.post(path.path + "/query", findEmail)
        .catch((err) => {
            res.status(400);
            res.send(err.response.data.message);
        })
    if (validate.data.length === 0) {
        let data = [{
            "_id": "users$newUser",
            "nickName": req.body.nickName,
            "email": req.body.email,
            "wallet": wallet,
            "avatar": req.body.avatar,
            "verifier": "metamask"
        }]

        let userData = await axios.post(path.path + "/transact", data)
            .catch((err) => {
                res.status(400);
                res.send(err.response.data.message);
            })
        if (userData.data.length !== 0) {
            await betteryToken.transferBetteryToken(wallet);
            res.status(200);
            res.send({
                "_id": userData.data.tempids['users$newUser'],
                "verifier": "metamask"
            })
        }

    } else {
        res.status(400);
        res.send("user already exist");
    }
}

const validate = (req, res) => {
    if (req.body.wallet !== undefined) {
        let conf = {
            "select": ["*",
                { "historyTransactions": ["*"] },
                { "invites": ["*"] }
            ],
            "from": ["users/wallet", req.body.wallet]
        }

        axios.post(path.path + "/query", conf).then((x) => {
            if (x.data.length != 0) {
                let o = userStructure(x.data[0])

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
        "select": ["*",
            { "historyTransactions": ["*"] },
            { "invites": ["*"] }
        ],
        "from": Number(req.body.id)
    }

    axios.post(path.path + "/query", conf).then((x) => {
        if (x.data.length != 0) {
            let o = userStructure(x.data[0])

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
        "select": ["*",
            { "historyTransactions": ["*"] },
            { "invites": ["*"] }
        ],
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
        _id: x["_id"],
        wallet: x["users/wallet"],
        nickName: x["users/nickName"],
        avatar: x["users/avatar"],
        email: x["users/email"],
        verifier: x["users/verifier"],
        historyTransaction: x["historyTransactions"] === undefined ? [] : x["historyTransactions"].map((history) => {
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
        invitationList: x["invites"] === undefined ? [] : x["invites"].map((invites) => {
            return {
                eventId: invites["invites/eventId"]["_id"],
                role: invites["invites/role"],
                status: invites["status"]
            }
        })
    }
}

module.exports = {
    registration,
    validate,
    allUsers,
    getUserById
}