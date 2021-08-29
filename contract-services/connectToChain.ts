import { DirectSecp256k1HdWallet, Registry } from "@cosmjs/proto-signing";
import { SigningStargateClient } from "@cosmjs/stargate";
import { MsgCreateMintBet } from "./funds/tx";
import { demonAPI } from "../config/path";


const types = [
    ["/VoroshilovMax.bettery.funds.MsgCreateMintBet", MsgCreateMintBet]
  ];

const registry = new Registry(<any>types);


const connectToSign = async () => {
   // let memonic = "ceiling million ecology bronze estate actress talk cargo few stamp steak foster vessel excuse outdoor maid desert usual slot together mobile alley sight hammer"
   let memonic = "zero sign extend retreat want tuition rookie volume knock knee hover one panda able panel cancel injury motion theory give team post rabbit salt"
    const wallet = await DirectSecp256k1HdWallet.fromMnemonic(
        memonic
    );

    let addr = `${demonAPI}:26657`;
    const [{ address }] = await wallet.getAccounts(); 
    const client = await SigningStargateClient.connectWithSigner(addr, wallet, { registry });
    return { memonic, address, client }
}

export {
    connectToSign
}