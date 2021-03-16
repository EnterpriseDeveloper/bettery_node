const PublicEventContract = require("../abi/PublicEvents.json");

const findCorrectAnswer = async (data) =>{
    console.log("from findCorrectAnswer")
    console.log(data);
    let id = data.id;

    let contract = await ContractInit.init(process.env.NODE_ENV, PublicEventContract);
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