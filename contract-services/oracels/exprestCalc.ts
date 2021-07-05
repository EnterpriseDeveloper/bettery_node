import ContractInit from "../contractInit";
import PublicEventContract from "../abi/PublicEvents.json";
import axios from "axios";
import path from "../../config/path";
import getNonce from "../nonce/nonce";
import config from "../../config/limits";
import getGasPrice from "../gasPrice/getGasPrice";

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
    let contract = await ContractInit.init(pathContr, PublicEventContract);

    try {
        let gasEstimate = await contract.methods.setActiveExpertsFromOracl(Number(expertsAmount), id).estimateGas();
        await contract.methods.setActiveExpertsFromOracl(Number(expertsAmount), id).send({
            gas: Number((((gasEstimate * config.gasPercent) / 100) + gasEstimate).toFixed(0)),
            gasPrice: await getGasPrice.getGasPriceSafeLow(),
            nonce: await getNonce.getNonce()
        });

        let send = [{
            "_id": Number(id),
            "validatorsAmount": expertsAmount
        }]
        await axios.post(`${path.path}/transact`, send).catch((err) => {
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