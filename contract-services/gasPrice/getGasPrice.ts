import axios from "axios";
import { gasEstimationMainAPI, gasEstimationMumbaiAPI } from "../../config/networks";
import Web3 from "web3";
import { gasPercent } from '../../config/limits'
import { getBlockGasLimit } from '../contractInit';

const getGasPrice = async () => {
    let data = await gas();
    let web3 = new Web3();
    console.log("gas price fast: ", String(data.fast))
    let fast = web3.utils.toWei(String(data.fast), "gwei");
    return fast;
}

const getGasPriceSafeLow = async () => {
    let data = await gas();
    let web3 = new Web3();
    console.log("gas price fast: ", String(data.safeLow))
    let safeLow = web3.utils.toWei(String(data.safeLow), "gwei");
    return safeLow;
}

const estimateGasLimit = async (gas: number) => {
    let gasBlock: any = 0;
    let neededGas = Number((((gas * gasPercent) / 100) + gas).toFixed(0));
    do {
        gasBlock = await getBlockGasLimit();
        if (gasBlock > neededGas || gasBlock == "infinity") {
            console.log("gas:", neededGas, gasBlock)
            return neededGas;
        }
    } while (neededGas > gasBlock || gasBlock != "infinity");
}

const gas = async () => {
    const path = process.env.NODE_ENV == "production" ? gasEstimationMainAPI : gasEstimationMumbaiAPI;

    let data: any = await axios.get(path).catch((err) => {
        console.log("get gas price err: " + err)
        return;
    })
    return data.data
}

export {
    getGasPrice,
    getGasPriceSafeLow,
    estimateGasLimit
}