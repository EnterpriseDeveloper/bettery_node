import MiddlePaymentContract from "../abi/MiddlePayment.json";
import { init } from "../contractInit";
import Web3 from "web3";
import { path } from "../../config/path";
import axios from "axios";
import { getNonce } from "../nonce/nonce";
import { getGasPriceSafeLow } from "../gasPrice/getGasPrice"
import { gasPercent } from "../../config/limits"

const payToExperts = async (data: any) => {
    console.log("from payToExperts")
    console.log(data);
    let id = data.id;

    let mintHost = data.mintHost;
    let payHost = data.payHost;
    let mintAdv = data.mintAdv;
    let payAdv = data.payAdv;

    let path = process.env.NODE_ENV
    let contract = await init(path, MiddlePaymentContract);
    try {
        let gasEstimate = await contract.methods.letsPayToExperts(id).estimateGas();
        await contract.methods.letsPayToExperts(id).send({
            gas: Number((((gasEstimate * gasPercent) / 100) + gasEstimate).toFixed(0)),
            gasPrice: await getGasPriceSafeLow(),
            nonce: await getNonce()
        });

        await setToDb(id, mintHost, payHost, mintAdv, payAdv);
    } catch (err) {
        console.log("err from pay to experts", err)
    }
}

const setToDb = async (id: any, mintHost: any, payHost: any, mintAdv: any, payAdv: any) => {
    let web3 = new Web3();
    let data = [{
        "_id": Number(id),
        "mintedHostAmount": Number(web3.utils.fromWei(String(mintHost), "ether")),
        "payHostAmount": Number(web3.utils.fromWei(String(payHost), "ether")),
        "mintedAdvisorAmount": Number(web3.utils.fromWei(String(mintAdv), "ether")),
        "payAdvisorAmount": Number(web3.utils.fromWei(String(payAdv), "ether"))
    }]
    await axios.post(`${path}/transact`, data).catch((err) => {
        console.log("DB error from transact payToLosers: " + err.response.data.message)
        return;
    })
    return;
}

export {
    payToExperts
}
