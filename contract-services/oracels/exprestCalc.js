const ContractInit = require("../contractInit.js");
const PublicEventContract = require("../abi/PublicEvent.json");

const expertCalc = async (data) => {
    let id = data.id;
    let players = Number(data.activePlayers);

    let experts = players / (players ** 0.5 + 2 - (2 ** 0.5));
    console.log(experts);
    let expertsAmount = expertsAmount.toFixed(0);
    console.log(expertsAmount);
    let contract = await ContractInit.init(process.env.NODE_ENV, PublicEventContract);

    try{
        let gasEstimate = await contract.methods.setActivePlayersFromOracl(Number(expertsAmount), id).estimateGas();
        await contract.methods.setActivePlayersFromOracl(Number(expertsAmount), id).send({
            gas: gasEstimate,
            gasPrice: 0
        });
    }catch(err){
      console.log("err from expert calclucation oracels", err)
    }
}

module.exports = {
    expertCalc
}