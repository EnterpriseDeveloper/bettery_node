const MiddlePaymentContract = require("../abi/MiddlePayment.json");
const ContractInit = require("../contractInit");
const getNonce = require("../nonce/nonce");
const getGasPrice = require("../gasPrice/getGasPrice")

const findCorrectAnswer = async (data) => {
    console.log("from findCorrectAnswer")
    console.log(data);
    let id = data.id;

    let path = process.env.NODE_ENV
    let contract = await ContractInit.init(path, MiddlePaymentContract);
    try {
        let gasPrice = await getGasPrice.getGasPriceSafeLow();
        let gasEstimate = await contract.methods.letsFindCorrectAnswer(id).estimateGas();
        let nonce = await getNonce.getNonce();
        await contract.methods.letsFindCorrectAnswer(id).send({
            gas: Number((((gasEstimate * 50) / 100) + gasEstimate).toFixed(0)),
            gasPrice: gasPrice,
            nonce: nonce
        });
    } catch (err) {
        console.log("err from find correct answer", err)
    }
}

module.exports = {
    findCorrectAnswer
}