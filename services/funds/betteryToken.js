const axios = require('axios');
const path = require("../../config/path")
const contractInit = require("../../contract-services/contractInit");
const BET = require("../../contract-services/abi/BET.json");
const getNonce = require("../../contract-services/nonce/nonce");
const getGasPrice = require("../../contract-services/gasPrice/getGasPrice");
const Web3 = require("web3");

const mintTokens = async (address, amount) => {
    let pathContr = process.env.NODE_ENV;
    let betteryContract = await contractInit.init(pathContr, BET)
    let gasPrice = await getGasPrice.getGasPrice();
    let nonce = await getNonce.getNonce();
    let web3 = new Web3();
    let amo = web3.utils.toWei(String(amount), "ether")
    let gasEstimate = await betteryContract.methods.mint(address, amo).estimateGas();
    return await betteryContract.methods.mint(address, amo).send({
        gas: Number((((gasEstimate * 50) / 100) + gasEstimate).toFixed(0)),
        gasPrice: gasPrice,
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
                let data = await mintTokens(wallet, 10)
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

const transferToken = async (oldWallet, newWallet) => {
    let pathContr = process.env.NODE_ENV;
    let betteryContract = await contractInit.init(pathContr, BET);
    let amount = await betteryContract.methods.balanceOf(oldWallet).call();
    if (amount != "0") {
        let web3 = new Web3();
        amount = web3.utils.fromWei(amount, "ether");
        console.log(typeof amount)
        console.log(amount);
        return await mintTokens(newWallet, amount);
    } else {
        return;
    }
}
module.exports = {
    mintTokens,
    getBTYToken,
    transferToken
}