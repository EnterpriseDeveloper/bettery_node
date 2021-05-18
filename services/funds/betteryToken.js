const axios = require('axios');
const path = require("../../config/path")
const contractInit = require("../../contract-services/contractInit");
const BET = require("../../contract-services/abi/BET.json");
const getNonce = require("../../contract-services/nonce/nonce");

const mintTokens = async (address) => {
    let pathContr = process.env.NODE_ENV;  
    let betteryContract = await contractInit.init(pathContr, BET)
    let nonce = await getNonce.getNonce();
    let gasEstimate = await betteryContract.methods.mint(address).estimateGas();
    return await betteryContract.methods.mint(address).send({
        gas: Number((((gasEstimate * 5) / 100) + gasEstimate).toFixed(0)),
        gasPrice: 0,
        nonce: nonce
    });
}

const getBTYToken = async (req, res) => {
    let email = req.body.email;
    if (email) {
        let findWallet = {
            "select": ["wallet"],
            "from": ["users/email", email]
        }
        let getWallet = await axios.post(`${path.path}/query`, findWallet).catch((err) => {
            res.status(400);
            res.send(err.response.data.message);
        })
        if (getWallet) {
            if (getWallet.data.length != 0) {
                let wallet = getWallet.data[0].wallet;
                let data = await mintTokens(wallet)
                res.status(200);
                res.send(data);
            } else {
                res.status(400);
                res.send({ "message": "user not exist" });
            }
        }
    } else {
        res.status(400);
        res.send({ "message": "email is missed" });
    }
}

module.exports = {
    mintTokens,
    getBTYToken
}