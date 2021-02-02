const axios = require("axios");
const path = require("../../config/path");
const betteryToken = require("../funds/betteryToken");
const structure = require('../../structure/user.struct');

const torusRegist = async (req, res) => {

    let wallet = req.body.wallet;
    let refId = req.body.refId;

    let findEmail = {
        "select": ["*",
            { "users/historyTransactions": ["*"] }
        ],
        "from": ["users/email", req.body.email]
    }

    let user = await axios.post(`${path.path}/query`, findEmail)
        .catch((err) => {
            res.status(400);
            res.send(err.response.data.message);
            return;
        })

    if (user.data.length === 0) {

        let data = [{
            "_id": "users$newUser",
            "nickName": req.body.nickName,
            "email": req.body.email,
            "wallet": wallet,
            "avatar": req.body.avatar,
            "verifier": req.body.verifier,
            "verifierId": req.body.verifierId
        }]

        if (!isNaN(refId)) {
            let findByref = await checkUserById(refId, res);
            if (findByref) {
                data[0].invitedBy = Number(refId),
                    data.push({
                        "_id": Number(refId),
                        "invited": ["users$newUser"]
                    })
            }
        }

        console.log(data);

        let x = await axios.post(`${path.path}/transact`, data).catch((err) => {
            res.status(400);
            res.send(err.response.data.message);
            return;
        })

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

    } else {
        let userStruct = structure.userStructure(user.data)
        res.status(200);
        res.send(userStruct[0]);
    }

}

let checkUserById = async (id, res) => {
    let findUser = {
        "select": ["*"],
        "from": Number(id)
    }

    let user = await axios.post(`${path.path}/query`, findUser)
        .catch((err) => {
            res.status(400);
            res.send(err.response.data.message);
            return;
        })

    return user.data.length === 0 ? false : true;
}

module.exports = {
    torusRegist
}