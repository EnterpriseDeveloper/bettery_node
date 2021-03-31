const PlayerPaymentContract = require("../abi/PlayerPayment.json");
const ContractInit = require("../contractInit");

const payToRefferers = async (data) => {
    console.log("from payToRefferers")
    console.log(data);
    let id = data.id;

    // TODO get fake address from contract
    // let addr1 = [];
    // let addr2 = [];
    // let addr3 = [];

    // TODO add prodaction 
    let path = "test" // process.env.NODE_ENV
    let contract = await ContractInit.init(path, PlayerPaymentContract);
    try {
        let gasEstimate = await contract.methods.payRefToComp(id, 1).estimateGas();
        await contract.methods.payRefToComp(id, 1).send({
            gas: gasEstimate,
            gasPrice: 0
        });

    } catch (err) {
        console.log("err from pay to pay to refferers", err)
    }
    // try {
    //     let gasEstimate = await contract.methods.payToReff(id, addr1, addr2, addr3).estimateGas();
    //     await contract.methods.payToReff(id, addr1, addr2, addr3).send({
    //         gas: gasEstimate,
    //         gasPrice: 0
    //     });

    //     // TODO add to db event finish
    // } catch (err) {
    //     console.log("err from pay to pay to refferers", err)
    // }

}

module.exports = {
    payToRefferers
}