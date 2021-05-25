const axios = require("axios");
const api = require("../../config/networks")
const Web3 = require("web3");

const getGasPrice = async () => {
    const path = process.env.NODE_ENV == "production" ? api.gasEstimationMainAPI : api.gasEstimationMumbaiAPI;

    let data = await axios.get(path).catch((err) => {
        console.log("get gas price err: " + err)
        return;
    })
    let web3 = new Web3();
    let fast = web3.utils.toWei(String(data.data.fast), "gwei");
    return fast;
}

module.exports = {
    getGasPrice
}