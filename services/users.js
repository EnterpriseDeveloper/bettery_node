
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
                res.status(200).end();
            }).catch((err) => {
                res.status(400);
                res.send("error to send new user to DB");
            })

        } else {
            res.status(400);
            res.send("user already exist");
        }

    }).catch((error) => {
        console.log("findNickName error:" + error);
        res.status(400);
        res.send(error);
    })
}

const validate = (req, res) => {
    if (req.body.wallet !== undefined) {
        let conf = {
            "select": ["*"],
            "from": ["users/wallet", req.body.wallet]
        }

        axios.post(path.path + "/query", conf).then((x) => {

            if (x.data !== null) {
                let o = {
                    _id: x.data["_id"],
                    wallet: x.data["users/wallet"],
                    nickName: x.data["users/nickName"],
                    avatar: x.data["users/avatar"],
                    email: x.data["users/email"]
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
        }).catch((error) => {
            console.log(error);
            res.status(400);
            res.send(error);
        })
    } else {
        res.status(400);
        res.send("reqest is undefined");
    }
}

const allUsers = (req, res) => {

    let conf = {
        "select": ["*"],
        "from": "users"
    }

    axios.post(path.path + "/query", conf).then((x) => {
        console.log(x.data);
        res.status(200);
        res.send(x.data);
    }).catch((error) => {
        console.log(error);
        res.status(400);
        res.send(error);
    })
}

module.exports = {
    registration,
    validate,
    allUsers
}