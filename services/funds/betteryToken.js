const Contract = require("../../contract-services/contract");
const Web3 = require("web3");
const axios = require('axios');
const path = require("../../config/path")

const transferBetteryToken = async (address) => {
    let web3 = new Web3();
    let amount = web3.utils.toWei("10", "ether");

    let contr = new Contract.Contract();
    let betteryContract = await contr.betteryToken();

    let gasEstimate = await betteryContract.methods.transfer(address, amount).estimateGas();
    return await betteryContract.methods.transfer(address, amount).send({
        gas: gasEstimate,
        gasPrice: 0
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
                let data = await transferBetteryToken(wallet)
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
    transferBetteryToken,
    getBTYToken
}