const Contract = require("../../contract-services/contract");

const receiveHoldMoney = async (userWallet, eventId) => {
    let contr = new Contract.Contract();
    let getContract = await contr.loadContract();

    try {
        const gasEstimate = await getContract.methods.getMoneyRetention(userWallet.toString()).estimateGas();

        await getContract.methods.getMoneyRetention(userWallet.toString()).send({
            gas: gasEstimate,
            gasPrice: 0
        });
    } catch (err) {
        console.log(err);
    }


}

module.exports = {
    receiveHoldMoney
}