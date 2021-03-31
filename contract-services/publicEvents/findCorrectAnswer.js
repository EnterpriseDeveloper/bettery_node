const MiddlePaymentContract = require("../abi/MiddlePayment.json");
const ContractInit = require("../contractInit");

const findCorrectAnswer = async (data) => {
    console.log("from findCorrectAnswer")
    console.log(data);
    let id = data.id;

    // TODO add prodaction 
    let path = "test" // process.env.NODE_ENV
    let contract = await ContractInit.init(path, MiddlePaymentContract);
    try {
        let gasEstimate = await contract.methods.letsFindCorrectAnswer(id).estimateGas();
        await contract.methods.letsFindCorrectAnswer(id).send({
            gas: gasEstimate,
            gasPrice: 0
        });
    } catch (err) {
        console.log("err from find correct answer", err)
    }
}

module.exports = {
    findCorrectAnswer
}