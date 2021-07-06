import PlayerPaymentContract from "../../abi/PlayerPayment.json";
import { init } from "../../contractInit";
import { setToDB } from "./setPaymentToDB";
import { getNonce } from "../../nonce/nonce";
import { getGasPriceSafeLow } from "../../gasPrice/getGasPrice"
import { gasPercent } from "../../../config/limits"

const payToLosers = async (data: any) => {
    console.log("from payToLosers")
    console.log(data);
    let id = data.id;
    let avarageBet = data.avarageBet;
    let calcMintedToken = data.calcMintedToken;

    let path = process.env.NODE_ENV
    let contract = await init(path, PlayerPaymentContract);
    try {
        let gasEstimate = await contract.methods.letsPayToLoosers(id, avarageBet, calcMintedToken).estimateGas();
        await contract.methods.letsPayToLoosers(id, avarageBet, calcMintedToken).send({
            gas: Number((((gasEstimate * gasPercent) / 100) + gasEstimate).toFixed(0)),
            gasPrice: await getGasPriceSafeLow(),
            nonce: await getNonce()
        });

        await setToDB(data);

    } catch (err) {
        console.log("err from pay to losers", err)
    }
}


export {
    payToLosers
}