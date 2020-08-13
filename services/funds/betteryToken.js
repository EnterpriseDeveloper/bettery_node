const Contract = require("../../contract-services/contract");
const Web3 = require("web3");

const transferBetteryToken = async (address) => {
    let web3 = new Web3();
    let amount = web3.utils.toWei("10", "ether");

    let contr = new Contract.Contract();
    let betteryContract = await contr.betteryToken();

    let gasEstimate = await betteryContract.methods.transfer(address, amount).estimateGas();
    return await betteryContract.methods.transfer(address, amount).send({
        gas: gasEstimate,
        gasPrice: 0
    });
}

module.exports = {
    transferBetteryToken
}