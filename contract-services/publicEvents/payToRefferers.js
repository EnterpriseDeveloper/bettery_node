const PublicEventContract = require("../abi/PublicEvents.json");

const payToRefferers = (data) => {
    console.log("from payToRefferers")
    console.log(data);
    let id = data.id;

    let contract = await ContractInit.init(process.env.NODE_ENV, PublicEventContract);
    try {
        let gasEstimate = await contract.methods.payToReff(id).estimateGas();
        await contract.methods.payToReff(id).send({
            gas: gasEstimate,
            gasPrice: 0
        });

        // TODO add to db event finish
    } catch (err) {
        console.log("err from pay to pay to refferers", err)
    }

}

module.exports = {
    payToRefferers
}