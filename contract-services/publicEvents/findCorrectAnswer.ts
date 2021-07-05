import MiddlePaymentContract from "../abi/MiddlePayment.json";
import ContractInit from "../contractInit";
import getNonce from "../nonce/nonce";
import getGasPrice from "../gasPrice/getGasPrice"
import config from "../../config/limits"

const findCorrectAnswer = async (data: any) => {
    console.log("from findCorrectAnswer")
    console.log(data);
    let id = data.id;

    let path = process.env.NODE_ENV
    let contract = await ContractInit.init(path, MiddlePaymentContract);
    try {
        let gasEstimate = await contract.methods.letsFindCorrectAnswer(id).estimateGas();
        await contract.methods.letsFindCorrectAnswer(id).send({
            gas: Number((((gasEstimate * config.gasPercent) / 100) + gasEstimate).toFixed(0)),
            gasPrice: await getGasPrice.getGasPriceSafeLow(),
            nonce: await getNonce.getNonce()
        });
    } catch (err) {
        console.log("err from find correct answer", err)
    }
}

export = {
    findCorrectAnswer
}