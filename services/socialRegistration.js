const axios = require("axios");
const path = require("../config/path");

const socialRegistration = (req, res) => {

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
            res.status(200);
            res.send({ "_id": x.data[0]["_id"] })
        }

    }).catch((err) => {
        res.status(400);
        res.send(err.response.data.message);
    })
}

module.exports = {
    socialRegistration
}