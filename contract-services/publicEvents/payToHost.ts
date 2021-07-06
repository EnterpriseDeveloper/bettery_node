import MiddlePaymentContract from "../abi/MiddlePayment.json";
import { init } from "../contractInit";
import { getNonce } from "../nonce/nonce";
import { getGasPriceSafeLow, estimateGasLimit } from "../gasPrice/getGasPrice"

const payToHost = async (data: any) => {
    console.log("from payToHost")
    console.log(data);
    let id = data.id;
    let premDF = data.premDF; // in wei
    let mintDF = data.mintDF; // in wei
    let mintCMF = data.mintCMF; // in wei
    let mintMF = data.mintMF; // in wei

    let path = process.env.NODE_ENV;
    let contract = await init(path, MiddlePaymentContract);
    try {
        let gasEstimate = await contract.methods.letsPaytoHost(id).estimateGas();
        await contract.methods.letsPaytoHost(id).send({
            gas: await estimateGasLimit(gasEstimate),
            gasPrice: await getGasPriceSafeLow(),
            nonce: await getNonce()
        });

        // TODO ADD TO DB
    } catch (err) {
        console.log("err from pay to host", err)
    }
}

export {
    payToHost
}