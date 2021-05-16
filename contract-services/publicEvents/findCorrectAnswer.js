const MiddlePaymentContract = require("../abi/MiddlePayment.json");
const ContractInit = require("../contractInit");
const getNonce = require("../nonce/nonce");
const statuses = require("./status");

const findCorrectAnswer = async (data) => {
    console.log("from findCorrectAnswer")
    console.log(data);
    let id = data.id;

    let status = await statuses.getStatus(id);
    console.log(status)
    if(status == "deployed"){
        console.log(status);
        await statuses.setStatus(id, "findCorrectAnswer")
        let path = process.env.NODE_ENV
        let contract = await ContractInit.init(path, MiddlePaymentContract);
        try {
            let gasEstimate = await contract.methods.letsFindCorrectAnswer(id).estimateGas();
            let nonce = await getNonce.getNonce();
            await contract.methods.letsFindCorrectAnswer(id).send({
                gas: gasEstimate,
                gasPrice: 0,
                nonce: nonce
            });
        } catch (err) {
            console.log("err from find correct answer", err)
        }

    }else{
        console.log("DUPLICATE findCorrectAnswer")
    }
}

module.exports = {
    findCorrectAnswer
}