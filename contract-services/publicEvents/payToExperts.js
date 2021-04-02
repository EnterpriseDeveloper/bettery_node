const MiddlePaymentContract = require("../abi/MiddlePayment.json");
const ContractInit = require("../contractInit");
const Web3 = require("web3");
const urt = require("../../config/path");

const payToExperts = async (data) => {
    console.log("from payToExperts")
    let id = data.id;
    let mintHost = data.mintHost;
    let payHost = data.payHost;
    let mintAdv = data.mintAdv;
    let payAdv = data.payAdv;
    let contract = await ContractInit.init(process.env.NODE_ENV, MiddlePaymentContract);
    try {
        let gasEstimate = await contract.methods.letsPayToExperts(id).estimateGas();
        await contract.methods.letsPayToExperts(id).send({
            gas: gasEstimate,
            gasPrice: 0
        });

        await setToDb(mintHost, payHost, mintAdv, payAdv);

        // TODO send to DB and calculate reputation of expert
    } catch (err) {
        console.log("err from pay to experts", err)
    }
}

const setToDb = async (id, mintHost, payHost, mintAdv, payAdv) => {
    let web3 = new Web3();
    let data = [{
      "_id": Number(id),
      "mintedHostAmount": web3.utils.fromWei(String(mintHost), "ether"),
      "payHostAmount": web3.utils.fromWei(String(payHost), "ether"),
      "mintedAdvisorAmount": web3.utils.fromWei(String(mintAdv), "ether"),
      "payAdvisorAmount": web3.utils.fromWei(String(payAdv), "ether")
    }]
    await axios.post(`${url.path}/transact`, data).catch((err) => {
        console.log("DB error from transact payToLosers: " + err.response.data.message)
        return;
    })
    return;
}

module.exports = {
    payToExperts
}
