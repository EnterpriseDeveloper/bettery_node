import MiddlePaymentContract from "../abi/MiddlePayment.json";
import Web3 from "web3";
import setAnswer from "../../services/events/event_is_finish";
import ContractInit from "../contractInit";
import getNonce from "../nonce/nonce";
import getGasPrice from "../gasPrice/getGasPrice"
import config from "../../config/limits"

const payToCompanies = async (x: any) => {
    console.log("from payToCompanies")
    console.log(x);
    let id = x.id;
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
        await contract.methods.letsPayToCompanies(id).send({
            gas: Number((((gasEstimate * config.gasPercent) / 100) + gasEstimate).toFixed(0)),
            gasPrice: await getGasPrice.getGasPriceSafeLow(),
            nonce: await getNonce.getNonce()
        });

    } catch (err) {
        console.log("err from pay to companies", err)
    }
}


export = {
    payToCompanies
}
