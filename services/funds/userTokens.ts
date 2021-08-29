import axios from "axios";
import { path, demonAPI } from "../../config/path";
import Web3 from "web3";

const getTokens = async (req: any, res: any) => {
    let wallet =  req.body.dataFromRedis.wallet
    
    if (req.body.dataFromRedis.id && wallet) {

        let balance: any = await axios.get(`${demonAPI}:1317/cosmos/bank/v1beta1/balances/${wallet}`).catch((err)=>{
            res.status(400);
            res.send(err.response);
            return
        })

        let web3 = new Web3();
        let bet = undefined;
        let bty = undefined;
        let balances = balance.data.balances
        bet = balances.find((x: any)=>{return x.denom == "bet"})
        if (bet){
            bet = bet.amount
        }
        bty = balances.find((x: any)=>{return x.denom == "bty"})
        if (bty){
            bty = bet.amount
        }

        let betToken = bet ? Number(Number(web3.utils.fromWei(bet, "ether")).toFixed(2)) : 0
        let btyToken = bty ? Number(Number(web3.utils.fromWei(bty, "ether")).toFixed(2)) : 0

        let data = [{
            "_id": Number(req.body.dataFromRedis.id),
            "bet": betToken,
            "bty": btyToken,
            "lastUpdate": Math.floor(Date.now() / 1000)
        }]

        axios.post(path + "/transact", data).then(() => {
            res.status(200);
            res.send({ 
                "bet": betToken,
                "bty": btyToken 
            })
        }).catch((err: any) => {
            res.status(400);
            res.send(err.response.data.message);
        })

    }else{
        res.status(400)
        res.send({ status: "Bad request 400" })
    }

}


export {
    getTokens
}
