const MiddlePaymentContract = require("../abi/MiddlePayment.json");
const ContractInit = require("../contractInit");
const getNonce = require("../nonce/nonce");
const getGasPrice = require("../gasPrice/getGasPrice")

const payToHost = async (data) => {
    console.log("from payToHost")
    console.log(data);
    let id = data.id;
    let premDF = data.premDF; // in wei
    let mintDF = data.mintDF; // in wei
    let mintCMF = data.mintCMF; // in wei
    let mintMF = data.mintMF; // in wei

    let path = process.env.NODE_ENV;
    let contract = await ContractInit.init(path, MiddlePaymentContract);
    try {
        let gasPrice = await getGasPrice.getGasPriceSafeLow();
        let gasEstimate = await contract.methods.letsPaytoHost(id).estimateGas();
        let nonce = await getNonce.getNonce();
        await contract.methods.letsPaytoHost(id).send({
            gas: Number((((gasEstimate * 50) / 100) + gasEstimate).toFixed(0)),
            gasPrice: gasPrice,
            nonce: nonce
        });

        // TODO ADD TO DB
    } catch (err) {
        console.log("err from pay to host", err)
    }
}

module.exports = {
    payToHost
}