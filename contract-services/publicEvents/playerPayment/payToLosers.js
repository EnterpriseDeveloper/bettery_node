const PlayerPaymentContract = require("../../abi/PlayerPayment.json");
const ContractInit = require("../../contractInit");
const setToDB = require("./setPaymentToDB");
const getNonce = require("../../nonce/nonce");
const statuses = require("../status");

const payToLosers = async (data) => {
    console.log("from payToLosers")
    console.log(data);
    let id = data.id;
    let status = await statuses.getStatus(id);
    console.log(status)
    if (status == "payToPlayers") {
        await statuses.setStatus(id, "payToLosers");
        let avarageBet = data.avarageBet;
        let calcMintedToken = data.calcMintedToken;

        let path = process.env.NODE_ENV
        let contract = await ContractInit.init(path, PlayerPaymentContract);
        try {
            let gasEstimate = await contract.methods.letsPayToLoosers(id, avarageBet, calcMintedToken).estimateGas();
            let nonce = await getNonce.getNonce();
            await contract.methods.letsPayToLoosers(id, avarageBet, calcMintedToken).send({
                gas: gasEstimate,
                gasPrice: 0,
                nonce: nonce
            });

            await setToDB.setToDB(data);

        } catch (err) {
            console.log("err from pay to losers", err)
        }
    } else {
        console.log("Duplicate from payToLosers")
    }
}


module.exports = {
    payToLosers
}