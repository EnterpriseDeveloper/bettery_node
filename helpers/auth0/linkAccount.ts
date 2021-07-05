const axios = require('axios');
const key = require("../../config/key");
const path = require("../../config/path");
const betToken = require("../../services/funds/betteryToken")

const init = async (res) => {
    let data = await axios.post(`${key.auth0Path}/oauth/token`,
        {
            "client_id": key.auth0ClientId,
            "client_secret": key.auth0Secret,
            "audience": `${key.auth0Path}/api/v2/`,
            "grant_type": "client_credentials"
        },
        {
            headers: {
                'Content-Type': 'application/json',
            }
        }).catch((err) => {
            console.log("error get auth0 token", err);
            res.status(400)
            res.send({ status: err })
            return;
        })
    return data.data.access_token;
}

const linkAccount = async (req, res) => {
    let accessKey = await init(res);
    let firstId = req.body.dataFromRedis.key[0].verifierId;
    let secondId = req.body.verifierId
    let secondUserId = secondId.substring(secondId.lastIndexOf('|') + 1);
    let verifier = getVerifier(secondId);
    let provider = getProvider(secondId);
    let x = await axios.post(`${key.auth0Path}/api/v2/users/${firstId}/identities`,
        {
            "provider": provider,
            "user_id": provider == "oauth2" ? `${verifier}|${secondUserId}` : secondUserId
        },
        {
            headers: {
                'Authorization': `Bearer ${accessKey}`,
                'Content-Type': 'application/json'
            }
        }).catch((err) => {
            console.log("from link auth0 ", err);
            res.status(400)
            res.send({ status: err })
            return;
        })
    if (x) {
        let linked = [{
            "_id": req.body.dataFromRedis.id,
            "linkedAccounts": [verifier]
        }]

        let z = await axios.post(`${path.path}/transact`, linked).catch((err) => {
            console.log("from link auth0 DB ", err)
            res.status(400)
            res.send({ status: err })
            return;
        })
        if (z) {
            let wallet = req.body.dataFromRedis.wallet
            await betToken.mintTokens(wallet, 10)
            res.status(200)
            res.send({ status: "done" })
        }

    }


}

const getProvider = (x) => {
    if (x.search("google-oauth2") != -1) {
        return "google-oauth2";
    } else if (x.search("oauth2") != -1) {
        return "oauth2";
    } else {
        return x.split('|')[0];
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

module.exports = {
    linkAccount
}

