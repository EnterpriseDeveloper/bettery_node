import axios from 'axios';
import { path } from "../../config/path"
import { init } from "../../contract-services/contractInit";
import BET from "../../contract-services/abi/BET.json";
import { getNonce } from "../../contract-services/nonce/nonce";
import { getGasPrice, estimateGasLimit } from "../../contract-services/gasPrice/getGasPrice";
import Web3 from "web3";

const mintTokens = async (address: any, amount: any) => {
    let pathContr = process.env.NODE_ENV;
    let betteryContract = await init(pathContr, BET)
    let web3 = new Web3();
    let amo = web3.utils.toWei(String(amount), "ether")
    let gasEstimate = await betteryContract.methods.mint(address, amo).estimateGas();
    return await betteryContract.methods.mint(address, amo).send({
        gas: await estimateGasLimit(gasEstimate),
        gasPrice: await getGasPrice(),
        nonce: await getNonce()
    });
}

const getBTYToken = async (req: any, res: any) => {
    let email = req.body.email;
    if (email) {
        let findWallet = {
            "select": ["wallet"],
            "from": ["users/email", email]
        }
        let getWallet = await axios.post(`${path}/query`, findWallet).catch((err) => {
            res.status(400);
            res.send(err.response.data.message);
        })
        if (getWallet) {
            if (getWallet.data.length != 0) {
                let wallet = getWallet.data[0].wallet;
                let data = await mintTokens(wallet, 10)
                res.status(200);
                res.send(data);
            } else {
                res.status(400);
                res.send({ "message": "user not exist" });
            }
        }
    } else {
        res.status(400);
        res.send({ "message": "email is missed" });
    }
}

const transferToken = async (oldWallet: any, newWallet: any) => {
    let pathContr = process.env.NODE_ENV;
    let betteryContract = await init(pathContr, BET);
    let amount = await betteryContract.methods.balanceOf(oldWallet).call();
    if (amount != "0") {
        let web3 = new Web3();
        amount = web3.utils.fromWei(amount, "ether");
        return await mintTokens(newWallet, amount);
    } else {
        return;
    }
}
export {
    mintTokens,
    getBTYToken,
    transferToken
}