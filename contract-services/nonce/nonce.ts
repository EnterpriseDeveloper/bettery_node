import Web3 from "web3";
import { maticMain, maticMumbaiHttps } from "../../config/networks";
import axios from "axios";
import { path } from "../../config/path";
var Mutex = require('async-mutex').Mutex;

const nonceInit = async () => {
    let { account, web3 } = await getAccount();

    let nonce = await web3.eth.getTransactionCount(account);
    let getNonceConfig = {
        "select": ["*"],
        "from": "configuration"
    }

    let getNonce: any = await axios.post(`${path}/query`, getNonceConfig).catch((err) => {
        console.log("get nonce err: " + err);
    })

    if (getNonce.data.length != 0) {
        let setNonce = [{
            "_id": getNonce.data[0]["_id"],
            "nonce": nonce
        }]
        return await axios.post(`${path}/transact`, setNonce).catch((err) => {
            console.log("set nonce err: " + err);
        })

    } else {
        let setNonce = [{
            "_id": "configuration$newConfig",
            "nonce": nonce
        }]
        return await axios.post(`${path}/transact`, setNonce).catch((err) => {
            console.log("set new nonce err: " + err);
        })
    }
}

const getNonce = async () => {
    const mutex = new Mutex();
    const release = await mutex.acquire();
    let getNonceConfig = {
        "select": ["*"],
        "from": "configuration"
    }

    let getNonce: any = await axios.post(`${path}/query`, getNonceConfig).catch((err) => {
        console.log("get nonce err: " + err);
    })

    let nonce = getNonce.data[0]['configuration/nonce'];
    let setNonce = [{
        "_id": getNonce.data[0]["_id"],
        "nonce": nonce + 1
    }]
    await axios.post(`${path}/transact`, setNonce).catch((err) => {
        console.log("set nonce err: " + err);
    })
    release();
    return nonce;
}

const getAccount = async () => {
    let provider = process.env.NODE_ENV == "production" ? maticMain : maticMumbaiHttps;
    let keys = process.env.NODE_ENV == "production" ? require("../keys/prod/privKey") : require("../keys/test/privKey");
    let web3 = new Web3(provider);
    const prKey = web3.eth.accounts.privateKeyToAccount('0x' + keys.key);
    await web3.eth.accounts.wallet.add(prKey);
    let accounts = await web3.eth.accounts.wallet;
    let account = accounts[0].address;
    return { account, web3 };
}

export {
    nonceInit,
    getNonce
}