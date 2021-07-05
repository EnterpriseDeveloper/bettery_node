const axios = require("axios");
const crypto = require('crypto-js');
const path = require("../../config/path");

const betteryToken = require("../funds/betteryToken");
const structure = require('../../structure/user.struct');
const { sendToRedis, redisDataStructure, getFromRedis, deleteFromRedis } = require('../../helpers/redis-helper')
const { secretRedis } = require('../../config/key');

const torusRegist = async (req, res) => {
    let wallet = req.body.wallet;
    let refId = req.body.refId;
    let email = req.body.email;
    let verifierId = getVerifier(req.body.verifierId);

    let findEmail = {
        "select": ["_id", "users/nickName", "users/email", "users/wallet", "users/avatar", "users/verifier", "users/linkedAccounts"],
        "from": email ? ["users/email", email] : ["users/wallet", req.body.wallet]
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
            "email": email,
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
        // TODO add session token from Redis
        const dataFromRedis = [{
            email: email ? email : 'undefined',
            wallet: req.body.wallet,
            _id: x.data.tempids['users$newUser'],
            typeOfLogin: req.body.verifier
        }]
        let dataToRedis = redisDataStructure(dataFromRedis, req)

        let sessionToken = dataRedisSend(req.body.wallet, dataToRedis)

        res.status(200);
        res.send({
            _id: x.data.tempids['users$newUser'],
            nickName: req.body.nickName,
            email: email,
            wallet: req.body.wallet,
            avatar: req.body.avatar,
            verifier: req.body.verifier,
            sessionToken: sessionToken,
            accessToken: req.body.accessToken
        })

    } else {
        let userStruct = structure.userStructure(user.data);
        if (userStruct[0].linkedAccounts.length != 0 &&
            !userStruct[0].linkedAccounts.includes(verifierId)) {
            //check if account exist return error
            let data = {
                email: userStruct[0].email,
                linkedAccounts: userStruct[0].linkedAccounts
            }
            res.status(302);
            res.send(data)
        } else {
            // move token from old account to new
            let update;
            if (userStruct[0].wallet != wallet) {
                await betteryToken.transferToken(userStruct[0].wallet, wallet);
                userStruct[0].wallet = wallet;
                update = [{
                    "_id": userStruct[0]._id,
                    "wallet": wallet,
                    "linkedAccounts": [verifierId]
                }]
            } else {
                // update link account
                update = [{
                    "_id": userStruct[0]._id,
                    "linkedAccounts": [verifierId]
                }]
            }

            await axios.post(`${path.path}/transact`, update).catch((err) => {
                console.log(err)
                res.status(400);
                res.send(err.response.data.message);
                return;
            })
            let dataToRedis = redisDataStructure(userStruct, req)

            userStruct[0].sessionToken = dataRedisSend(userStruct[0].wallet, dataToRedis)
            userStruct[0].accessToken = req.body.accessToken

            res.status(200);
            res.send(userStruct[0]);
        }
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

const autoLogin = async (req, res) => {
    let wallet = req.body.wallet;
    let accessToken = req.body.accessToken;

    let detectUser = await getFromRedis(wallet);
    if (detectUser == null) {
        res.status(400);
        res.send('not valid token');
        return
    } else {
        if (detectUser.key.find((x) => { return x.sessionKey == accessToken }) == undefined) {
            res.status(400);
            res.send('not valid token');
            return
        } else {
            let findUser = {
                "select": ["_id", "users/nickName", "users/email", "users/wallet", "users/avatar", "users/verifier", "users/linkedAccounts"],
                "from": ["users/wallet", wallet]
            }

            let user = await axios.post(`${path.path}/query`, findUser)
                .catch((err) => {
                    res.status(400);
                    res.send(err.response.data.message);
                    return;
                })

            let o = structure.userStructure(user.data);
            o[0].accessToken = accessToken
            o[0].sessionToken = crypto.AES.encrypt(wallet, secretRedis).toString()
            res.status(200);
            res.send(o[0]);
        }
    }
}

const logout = async (req, res) => {
    let wallet = req.body.dataFromRedis.wallet;
    let accessToken = req.body.dataFromRedis.key[0].sessionKey;
    try {
        await deleteFromRedis(wallet, accessToken)
        res.status(200)
        res.send({})
    } catch (e) {
        res.status(400)
        res.send(e, 'error logout')
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

const dataRedisSend = (wallet, dataToRedis) => {
    sendToRedis(wallet, dataToRedis)
    return crypto.AES.encrypt(wallet, secretRedis).toString()
}

module.exports = {
    torusRegist,
    autoLogin,
    logout
}
