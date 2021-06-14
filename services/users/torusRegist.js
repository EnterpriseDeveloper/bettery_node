const axios = require("axios");
const crypto = require('crypto-js');
const path = require("../../config/path");

const betteryToken = require("../funds/betteryToken");
const structure = require('../../structure/user.struct');
const {sendToRedis, redisDataStructure} = require('../../helpers/redis-helper')
const {secretRedis} = require('../../config/key');

const torusRegist = async (req, res) => {

    let wallet = req.body.wallet;
    let refId = req.body.refId;
    let email = req.body.email;
    let verifierId = getVerifier(req.body.verifierId);

    let findEmail = {
        "select": ["*",
            { "users/historyTransactions": ["*"] }
        ],
        "from": email ? ["users/email", req.body.email] : ["users/nickName", req.body.nickName]
    }

    let user = await axios.post(`${path.path}/query`, findEmail)
        .catch((err) => {
            res.status(400);
            res.send(err.response.data.message);
            return;
        })

    if (user.data.length === 0) {
        // TODO move token from old account to new

        let data = [{
            "_id": "users$newUser",
            "nickName": req.body.nickName,
            "email": req.body.email,
            "wallet": wallet,
            "avatar": req.body.avatar == "" ? 'https://api.bettery.io/image/avatar.png' : req.body.avatar,
            "verifier": req.body.verifier,
            "linkedAccounts": [verifierId]
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

        let x = await axios.post(`${path.path}/transact`, data).catch((err) => {
            res.status(400);
            res.send(err.response.data.message);
            return;
        })

        await betteryToken.mintTokens(wallet, 10);
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
        // TODO check if account exist return error
        let userStruct = structure.userStructure(user.data);

        // update link account
        let update = [{
            "_id": userStruct[0]._id,
            "linkedAccounts": [verifierId]
        }]
        await axios.post(`${path.path}/transact`, update).catch((err) => {
            console.log(err)
            res.status(400);
            res.send(err.response.data.message);
            return;
        })
        let dataToRedis = redisDataStructure(userStruct, req)

        sendToRedis(userStruct[0].email, dataToRedis)
        userStruct[0].sessionToken = crypto.AES.encrypt(userStruct[0].email, secretRedis).toString()

        res.status(200);
        res.send(userStruct[0]);
    }
}

const getVerifier = (x) => {
    if (x.search("google-oauth2") != -1) {
        return "google";
    } else if (x.search("oauth2") != -1) {
        return x.split('|')[1];
    } else {
        return x.split('|')[0];
    }
}



const checkUserById = async (id, res) => {
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
