import { DirectSecp256k1HdWallet, Registry } from "@cosmjs/proto-signing";
import { SigningStargateClient } from "@cosmjs/stargate";
import { MsgCreateMintBet } from "./funds/tx";
import {MsgCreateFihishPubEvent, MsgCreateRefPubEvents} from './publicEvents/tx';
import { demonAPI } from "../config/path";


const types = [
    ["/VoroshilovMax.bettery.funds.MsgCreateMintBet", MsgCreateMintBet],
    ["/VoroshilovMax.bettery.publicevents.MsgCreateFihishPubEvent", MsgCreateFihishPubEvent],
    ["/VoroshilovMax.bettery.publicevents.MsgCreateRefPubEvents", MsgCreateRefPubEvents]
  ];

const registry = new Registry(<any>types);


const connectToSign = async () => {
   let memonic = "runway all vivid glove black unknown client table replace brush snake save unveil creek put panic rare explain chapter able radio harbor gadget urban"
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
