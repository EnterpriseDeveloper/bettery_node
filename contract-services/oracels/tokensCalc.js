const ContractInit = require("../contractInit.js");
const PublicEventContract = require("../abi/PublicEvents.json");
const Web3 = require("web3");

const tokensAmountCalc = async (data) => {
    let eventsId = Number(data.id);
    let GFIndex = Number(data.GFindex);
    let pool = Number(data.pool);
    let playersAmount = Number(activePlayers);
    let controversy = (100 - playersAmount) / 100;
    console.log("controversy: " + controversy)
    let averageBet = pool / playersAmount;
    console.log("controversy: " + averageBet)
    let mintedTokens = averageBet * playersAmount * controversy * (GFIndex / 100);
    console.log("controversy: " + mintedTokens)

    let web3 = new Web3();
    let tokens = web3.methods.toWei(mintedTokens, "ether");

    let contract = await ContractInit.init(process.env.NODE_ENV, PublicEventContract);
    try{
        let gasEstimate = await contract.methods.letsFinishEvent(eventsId, tokens).estimateGas();
        await contract.methods.letsFinishEvent(eventsId, tokens).send({
            gas: gasEstimate,
            gasPrice: 0
        });
    }catch(err){
      console.log("err from expert token amount oracels", err)
    }

}

module.exports = {
    tokensAmountCalc
}