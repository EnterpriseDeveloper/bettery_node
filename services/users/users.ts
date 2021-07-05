
const axios = require("axios");
const path = require("../../config/path");
const crypto = require('crypto-js');
const structure = require('../../structure/user.struct')
const { secretRedis } = require('../../config/key');
const reputationConvert = require("../../helpers/reputationConvert")

const updateNickname = async (req, res) => {
    let id = req.body.dataFromRedis.id;
    let name = req.body.newNickName;

    let update = [{
        "_id": id,
        "users/nickName": name
    }]

    await axios.post(`${path.path}/transact`, update).catch((err) => {
        console.log(err)
        res.status(400);
        res.send(err.response.data.message);
        return
    })
    res.status(200);
    res.send({ name });
};

const updatePublicEmail = async (req, res) => {
    let id = req.body.dataFromRedis.id;
    let publicEmail = req.body.publicEmail;

    let update = [{
        "_id": id,
        "users/publicEmail": publicEmail
    }]

    await axios.post(`${path.path}/transact`, update).catch((err) => {
        console.log(err)
        res.status(400);
        res.send(err.response.data.message);
        return
    })
    res.status(200);
    res.send({ publicEmail });
};


const getUserById = (req, res) => {
    let conf = {
        "select": ["_id", "users/nickName", "users/email", "users/wallet", "users/avatar", "users/verifier", "users/linkedAccounts"],
        "from": Number(req.body.id)
    }

    axios.post(path.path + "/query", conf).then((x) => {
        if (x.data.length != 0) {
            let o = structure.userStructure([x.data[0]])
            o[0].accessToken = req.body.dataFromRedis.key[0].sessionKey
            o[0].sessionToken = crypto.AES.encrypt(req.body.dataFromRedis.wallet, secretRedis).toString()
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
        "select": ["_id", "users/nickName", "users/email", "users/wallet", "users/avatar", "users/verifier", "users/linkedAccounts"],
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

const additionalInfo = async (req, res) => {
    let conf = {
        "select": ["linkedAccounts", "publicEmail", "advisorReputPoins", "playerReputPoins", "hostReputPoins", "expertReputPoins", {
            "invitedBy":
                ["_id", "users/avatar", "users/nickName"]
        }],
        "from": Number(req.body.id)
    }

    let data = await axios.post(path.path + "/query", conf).catch((err) => {
        res.status(400);
        res.send(err.response.data.message);
        return;
    })

    // TODO add location, language, share data, public/private email
    let x = data.data[0];
    let user = {
        linkedAccounts: x['linkedAccounts'] == undefined ? [] : x['linkedAccounts'],
        invitedBy: x["invitedBy"] == undefined ? null : {
            id: x["invitedBy"]["_id"],
            nickName: x["invitedBy"]["users/nickName"],
            avatar: x["invitedBy"]["users/avatar"]
        },
        publicEmail: x['publicEmail'] == undefined ? null : x['publicEmail'],
        advisorReputPoins: x['advisorReputPoins'] == undefined ? null : x['advisorReputPoins'],
        playerReputPoins: x['playerReputPoins'] == undefined ? null : x['playerReputPoins'],
        hostReputPoins: x['hostReputPoins'] == undefined ? null : x['hostReputPoins'],
        expertReputPoins: reputationConvert(x['expertReputPoins'] == undefined ? null : x['expertReputPoins'])
    }
    res.status(200);
    res.send(user);
}


module.exports = {
    allUsers,
    getUserById,
    additionalInfo,
    updateNickname,
    updatePublicEmail
}
