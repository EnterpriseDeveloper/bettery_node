const MiddlePaymentContract = require("../abi/MiddlePayment.json");
const Web3 = require("web3");
const setAnswer = require("../../services/events/event_is_finish");

const payToCompanies = async (x) => {
    console.log("from payToCompanies")
    console.log(x);
    let web3 = new Web3();
    let id = x.id;
    let tokens = web3.utils.fromWei(String(x.tokens), "ether");
    let correctAnswer = Number(x.correctAnswer);

    let data = [{
        id: Number(id),
        correctAnswer: correctAnswer,
        tokens: tokens
    }]

    await setAnswer.setCorrectAnswer(data);

    let contract = await ContractInit.init(process.env.NODE_ENV, MiddlePaymentContract);
    try {
        let gasEstimate = await contract.methods.letsPayToCompanies(id).estimateGas();
        await contract.methods.letsPayToCompanies(id).send({
            gas: gasEstimate,
            gasPrice: 0
        });

    } catch (err) {
        console.log("err from pay to companies", err)
    }
}


module.exports = {
    payToCompanies
}
