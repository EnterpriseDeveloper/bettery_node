import MiddlePaymentContract from "../abi/MiddlePayment.json";
import Web3 from "web3";
import { setCorrectAnswer } from "../../services/events/event_is_finish";
import { init } from "../contractInit";
import { getNonce } from "../nonce/nonce";
import { getGasPriceSafeLow, estimateGasLimit } from "../gasPrice/getGasPrice"

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

    await setCorrectAnswer(data);

    let path = process.env.NODE_ENV;
    let contract = await init(path, MiddlePaymentContract);
    try {
        let gasEstimate = await contract.methods.letsPayToCompanies(id).estimateGas();
        await contract.methods.letsPayToCompanies(id).send({
            gas: await estimateGasLimit(gasEstimate),
            gasPrice: await getGasPriceSafeLow(),
            nonce: await getNonce()
        });

    } catch (err) {
        console.log("err from pay to companies", err)
    }
}


export {
    payToCompanies
}
