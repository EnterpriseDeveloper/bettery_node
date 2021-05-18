const ContractInit = require("../contractInit.js");
const PublicEventContract = require("../abi/PublicEvents.json");
const axios = require("axios");
const path = require("../../config/path");
const getNonce = require("../nonce/nonce");

const expertCalc = async (data) => {
    let id = data.id;
    let players = Number(data.activePlayers);
    let experts = 0;
    if (players < 11) {
        experts = 3;
    } else {
        experts = players / (Math.pow(players, 0.5) + 2 - (Math.pow(2, 0.5)));
    }

    let expertsAmount = Math.round(experts);
    console.log("expertsAmount: " + expertsAmount);
    let pathContr = process.env.NODE_ENV
    let contract = await ContractInit.init(pathContr, PublicEventContract);

    try {
        let gasEstimate = await contract.methods.setActiveExpertsFromOracl(Number(expertsAmount), id).estimateGas();
        let nonce = await getNonce.getNonce();
        await contract.methods.setActiveExpertsFromOracl(Number(expertsAmount), id).send({
            gas: Number((((gasEstimate * 5) / 100) + gasEstimate).toFixed(0)),
            gasPrice: 0,
            nonce: nonce
        });

        let send = [{
            "_id": Number(id),
            "validatorsAmount": expertsAmount
        }]
        await axios.post(`${path.path}/transact`, send).catch((err) => {
            console.log("err from DB calclucation oracels: " + err.response.data.message)
            return;
        })

    } catch (err) {
        console.log("err from expert calclucation oracels", err)
    }
}

module.exports = {
    expertCalc
}