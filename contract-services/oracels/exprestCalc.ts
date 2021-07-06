import { init } from "../contractInit";
import PublicEventContract from "../abi/PublicEvents.json";
import axios from "axios";
import { path } from "../../config/path";
import { getNonce } from "../nonce/nonce";
import { getGasPriceSafeLow, estimateGasLimit } from "../gasPrice/getGasPrice";

const expertCalc = async (data: any) => {
    let id = data.id;
    let players = Number(data.activePlayers);
    let experts = 0;
    if (players < 11) {
        experts = 3;
    } else {
        experts = players / (Math.pow(players, 0.5) + 2 - (Math.pow(2, 0.5)));
    }

    let expertsAmount = Math.round(experts);
    console.log("expertsAmount: " + expertsAmount);
    let pathContr = process.env.NODE_ENV
    let contract = await init(pathContr, PublicEventContract);

    try {
        let gasEstimate = await contract.methods.setActiveExpertsFromOracl(Number(expertsAmount), id).estimateGas();
        await contract.methods.setActiveExpertsFromOracl(Number(expertsAmount), id).send({
            gas: await estimateGasLimit(gasEstimate),
            gasPrice: await getGasPriceSafeLow(),
            nonce: await getNonce()
        });

        let send = [{
            "_id": Number(id),
            "validatorsAmount": expertsAmount
        }]
        await axios.post(`${path}/transact`, send).catch((err) => {
            console.log("err from DB calclucation oracels: " + err.response.data.message)
            return;
        })

    } catch (err) {
        console.log("err from expert calclucation oracels", err)
    }
}

export {
    expertCalc
}