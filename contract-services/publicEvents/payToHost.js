const MiddlePaymentContract = require("../abi/MiddlePayment.json");
const ContractInit = require("../contractInit");
const getNonce = require("../nonce/nonce");
const statuses = require("./status");

const payToHost = async (data) => {
    console.log("from payToHost")
    console.log(data);
    let id = data.id;
    let status = await statuses.getStatus(id);
    console.log(status)
    if(status == "payToCompanies"){
        await statuses.setStatus(id, "payToHost")
        let premDF = data.premDF; // in wei
        let mintDF = data.mintDF; // in wei
        let mintCMF = data.mintCMF; // in wei
        let mintMF = data.mintMF; // in wei
    
        let path = process.env.NODE_ENV;
        let contract = await ContractInit.init(path, MiddlePaymentContract);
        try {
            let gasEstimate = await contract.methods.letsPaytoHost(id).estimateGas();
            let nonce = await getNonce.getNonce();
            await contract.methods.letsPaytoHost(id).send({
                gas: gasEstimate * 2,
                gasPrice: 0,
                nonce: nonce
            });
    
            // TODO ADD TO DB
        } catch (err) {
            console.log("err from pay to host", err)
        }
    }else{
        console.log("DUBLICATE from payToHost")
    }
}

module.exports = {
    payToHost
}