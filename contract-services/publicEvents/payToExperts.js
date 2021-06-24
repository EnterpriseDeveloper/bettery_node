const MiddlePaymentContract = require("../abi/MiddlePayment.json");
const ContractInit = require("../contractInit");
const Web3 = require("web3");
const url = require("../../config/path");
const axios = require("axios");
const getNonce = require("../nonce/nonce");
const getGasPrice = require("../gasPrice/getGasPrice")

const payToExperts = async (data) => {
    console.log("from payToExperts")
    console.log(data);
    let id = data.id;

    let mintHost = data.mintHost;
    let payHost = data.payHost;
    let mintAdv = data.mintAdv;
    let payAdv = data.payAdv;

    let path = process.env.NODE_ENV
    let contract = await ContractInit.init(path, MiddlePaymentContract);
    try {
        let gasPrice = await getGasPrice.getGasPriceSafeLow();
        let gasEstimate = await contract.methods.letsPayToExperts(id).estimateGas();
        let nonce = await getNonce.getNonce();
        await contract.methods.letsPayToExperts(id).send({
            gas: Number((((gasEstimate * 50) / 100) + gasEstimate).toFixed(0)),
            gasPrice: gasPrice,
            nonce: nonce
        });

        await setToDb(id, mintHost, payHost, mintAdv, payAdv);
    } catch (err) {
        console.log("err from pay to experts", err)
    }
}

const setToDb = async (id, mintHost, payHost, mintAdv, payAdv) => {
    let web3 = new Web3();
    let data = [{
        "_id": Number(id),
        "mintedHostAmount": Number(web3.utils.fromWei(String(mintHost), "ether")),
        "payHostAmount": Number(web3.utils.fromWei(String(payHost), "ether")),
        "mintedAdvisorAmount": Number(web3.utils.fromWei(String(mintAdv), "ether")),
        "payAdvisorAmount": Number(web3.utils.fromWei(String(payAdv), "ether"))
    }]
    await axios.post(`${url.path}/transact`, data).catch((err) => {
        console.log("DB error from transact payToLosers: " + err.response.data.message)
        return;
    })
    return;
}

module.exports = {
    payToExperts
}
