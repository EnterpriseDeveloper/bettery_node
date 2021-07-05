import PlayerPaymentContract from "../../abi/PlayerPayment.json";
import ContractInit from "../../contractInit";
import setToDB from "./setPaymentToDB";
import getNonce from "../../nonce/nonce";
import getGasPrice from "../../gasPrice/getGasPrice"
import config from "../../../config/limits"

const payToLosers = async (data: any) => {
    console.log("from payToLosers")
    console.log(data);
    let id = data.id;
    let avarageBet = data.avarageBet;
    let calcMintedToken = data.calcMintedToken;

    let path = process.env.NODE_ENV
    let contract = await ContractInit.init(path, PlayerPaymentContract);
    try {
        let gasEstimate = await contract.methods.letsPayToLoosers(id, avarageBet, calcMintedToken).estimateGas();
        await contract.methods.letsPayToLoosers(id, avarageBet, calcMintedToken).send({
            gas: Number((((gasEstimate * config.gasPercent) / 100) + gasEstimate).toFixed(0)),
            gasPrice: await getGasPrice.getGasPriceSafeLow(),
            nonce: await getNonce.getNonce()
        });

        await setToDB.setToDB(data);

    } catch (err) {
        console.log("err from pay to losers", err)
    }
}


export = {
    payToLosers
}