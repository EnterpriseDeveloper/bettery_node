const Contract = require("../contract-services/contract");

const receiveHoldMoney = async (loomWallet, eventId) => {
    let contr = new Contract.Contract();
    let getContract = await contr.loadContract();

    await getContract.methods.getMoneyRetention(loomWallet.toString()).send();
}

module.exports = {
    receiveHoldMoney
}