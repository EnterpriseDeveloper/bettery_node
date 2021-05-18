const MiddlePaymentContract = require("../abi/MiddlePayment.json");
const Web3 = require("web3");
const setAnswer = require("../../services/events/event_is_finish");
const ContractInit = require("../contractInit");
const getNonce = require("../nonce/nonce");
const statuses = require("./status");

const payToCompanies = async (x) => {
    console.log("from payToCompanies")
    console.log(x);
    let id = x.id;
    let status = await statuses.getStatus(id)
    console.log(status)
    if(status == "findCorrectAnswer"){
        await statuses.setStatus(id, "payToCompanies");
        let web3 = new Web3();
        let tokens = Number(web3.utils.fromWei(String(x.tokens), "ether"));
        let correctAnswer = Number(x.correctAnswer);
    
        let data = {
            id: Number(id),
            correctAnswer: correctAnswer,
            tokens: tokens
        }
    
        await setAnswer.setCorrectAnswer(data);
    
        let path = process.env.NODE_ENV;
        let contract = await ContractInit.init(path, MiddlePaymentContract);
        try {
            let gasEstimate = await contract.methods.letsPayToCompanies(id).estimateGas();
            let nonce = await getNonce.getNonce();
            await contract.methods.letsPayToCompanies(id).send({
                gas: Number((((gasEstimate * 5) / 100) + gasEstimate).toFixed(0)),
                gasPrice: 0,
                nonce: nonce
            });
    
        } catch (err) {
            console.log("err from pay to companies", err)
        }
    }else{
        console.log("DUPLICATE FROM payToCompanies")
    }
}


module.exports = {
    payToCompanies
}
