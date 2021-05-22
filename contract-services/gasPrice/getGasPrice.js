const axios = require("axios");
const api = require("../../config/networks")

const getGasPrice = async () =>{
    const path = process.env.NODE_ENV == "production" ? api.gasEstimationMainAPI : api.gasEstimationMumbaiAPI;

    let data = await axios.get(path).catch((err)=>{
       console.log("get gas price err: " + err)
    })
    console.log(data.data.fast)
    return Number(data.data.fast)
}

module.exports = {
    getGasPrice
}