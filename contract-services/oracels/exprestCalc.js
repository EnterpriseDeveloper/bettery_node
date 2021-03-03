const ContractInit = require("../contractInit.js");
const PublicEventContract = require("../abi/PublicEvents.json");
const axios = require("axios");
const path = require("../../config/path");

const expertCalc = async (data) => {
    let id = data.id;
    let players = Number(data.activePlayers);

    let experts = players / (players ** 0.5 + 2 - (2 ** 0.5));
    let expertsAmount = experts.toFixed(0);
    let contract = await ContractInit.init(process.env.NODE_ENV, PublicEventContract);

    try {
        let gasEstimate = await contract.methods.setActivePlayersFromOracl(Number(expertsAmount), id).estimateGas();
        await contract.methods.setActivePlayersFromOracl(Number(expertsAmount), id).send({
            gas: gasEstimate,
            gasPrice: 0
        });

        let send = [{
            "_id": id,
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