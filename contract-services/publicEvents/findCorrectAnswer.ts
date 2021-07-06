import MiddlePaymentContract from "../abi/MiddlePayment.json";
import { init } from "../contractInit";
import { getNonce } from "../nonce/nonce";
import { getGasPriceSafeLow } from "../gasPrice/getGasPrice"
import { gasPercent } from "../../config/limits"

const findCorrectAnswer = async (data: any) => {
    console.log("from findCorrectAnswer")
    console.log(data);
    let id = data.id;

    let path = process.env.NODE_ENV
    let contract = await init(path, MiddlePaymentContract);
    try {
        let gasEstimate = await contract.methods.letsFindCorrectAnswer(id).estimateGas();
        await contract.methods.letsFindCorrectAnswer(id).send({
            gas: Number((((gasEstimate * gasPercent) / 100) + gasEstimate).toFixed(0)),
            gasPrice: await getGasPriceSafeLow(),
            nonce: await getNonce()
        });
    } catch (err) {
        console.log("err from find correct answer", err)
    }
}

export {
    findCorrectAnswer
}