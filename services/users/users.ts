
import axios from "axios";
import { path } from "../../config/path";
import crypto from 'crypto-js';
import { userStructure } from '../../structure/user.struct'
import config from '../../config/key';
import reputationConvert from "../../helpers/reputationConvert"

const updateNickname = async (req: any, res: any) => {
    let id = req.body.dataFromRedis.id;
    let name = req.body.newNickName;

    let update = [{
        "_id": id,
        "users/nickName": name
    }]

    await axios.post(`${path}/transact`, update).catch((err) => {
        console.log(err)
        res.status(400);
        res.send(err.response.data.message);
        return
    })
    res.status(200);
    res.send({ name });
};

const updatePublicEmail = async (req: any, res: any) => {
    let id = req.body.dataFromRedis.id;
    let publicEmail = req.body.publicEmail;

    let update = [{
        "_id": id,
        "users/publicEmail": publicEmail
    }]

    await axios.post(`${path}/transact`, update).catch((err) => {
        console.log(err)
        res.status(400);
        res.send(err.response.data.message);
        return
    })
    res.status(200);
    res.send({ publicEmail });
};


const getUserById = (req: any, res: any) => {
    let conf = {
        "select": ["_id", "users/nickName", "users/email", "users/wallet", "users/avatar", "users/verifier", "users/linkedAccounts"],
        "from": Number(req.body.id)
    }

    axios.post(path + "/query", conf).then((x) => {
        if (x.data.length != 0) {
            let o = userStructure([x.data[0]])
            o[0].accessToken = req.body.dataFromRedis.key[0].sessionKey
            o[0].sessionToken = crypto.AES.encrypt(req.body.dataFromRedis.wallet, config.secretRedis).toString()
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

const allUsers = (req: any, res: any) => {

    let conf = {
        "select": ["_id", "users/nickName", "users/email", "users/wallet", "users/avatar", "users/verifier", "users/linkedAccounts"],
        "from": "users"
    }

    axios.post(path + "/query", conf).then((o) => {
        let result = userStructure(o.data);

        res.status(200);
        res.send(result);
    }).catch((err) => {
        res.status(400);
        res.send(err.response.data.message);
    })
}

const additionalInfo = async (req: any, res: any) => {
    let conf = {
        "select": ["linkedAccounts", "publicEmail", "advisorReputPoins", "playerReputPoins", "hostReputPoins", "expertReputPoins", {
            "invitedBy":
                ["_id", "users/avatar", "users/nickName"]
        }],
        "from": Number(req.body.id)
    }

    let data: any = await axios.post(path + "/query", conf).catch((err) => {
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


export {
    allUsers,
    getUserById,
    additionalInfo,
    updateNickname,
    updatePublicEmail
}
