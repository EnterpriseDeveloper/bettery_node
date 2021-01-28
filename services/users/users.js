
const axios = require("axios");
const path = require("../../config/path");
const betteryToken = require("../funds/betteryToken");
const structure = require('../../structure/user.struct')

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
                { "historyTransactions": ["*"] }
            ],
            "from": ["users/wallet", req.body.wallet]
        }

        axios.post(path.path + "/query", conf).then((x) => {
            if (x.data.length != 0) {
                let o = structure.userStructure([x.data[0]])

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
            { "historyTransactions": ["*"] }
        ],
        "from": Number(req.body.id)
    }

    axios.post(path.path + "/query", conf).then((x) => {
        if (x.data.length != 0) {
            let o = structure.userStructure([x.data[0]])

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
            { "historyTransactions": ["*"] }
        ],
        "from": "users"
    }

    axios.post(path.path + "/query", conf).then((o) => {
        let result = structure.userStructure(o.data);

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
    allUsers,
    getUserById
}