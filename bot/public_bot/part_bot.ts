import axios from "axios";
import Web3 from "web3";
import {demonAPI, path} from "../../config/path";
import {SigningStargateClient} from "@cosmjs/stargate";
import {DirectSecp256k1HdWallet, Registry} from "@cosmjs/proto-signing";
import {MsgCreatePartPubEvents} from "../../contract-services/publicEvents/tx";

import {mintTokens} from "../../services/funds/betteryToken";
import {balanceCheck} from "../../services/funds/userTokens";
import {participateSendToDB} from "../../services/events/publicActivites";

let particOfBots = async (req: any, res: any) => {
    const eventId = req.body.id
    const botAmount = req.body.botAmount

    if(!botAmount || botAmount > 50){
        res.status(400)
        res.send({message: "enter the correct number of bots ( bots > 0 && bots <= 50)"})
    }else {
        const eventParams = {
            "select": ['answers'],
            "from": eventId,
        }
        const botParams = {
            "select": ["users/wallet", "users/seedPhrase"],
            "where": "users/isBot = true"
        }

        let event = await axios.post(`${path}/query`, eventParams).catch((err) => {
            res.status(400);
            res.send(err.return.data.message);
            return;
        })

        let bots = await axios.post(`${path}/query`, botParams).catch((err) => {
            res.status(400);
            res.send(err.return.data.message);
            return;
        })

        if (bots && bots.data.length && event && event.data.length) {
            let response = await botParc(bots.data, event.data[0], eventId, botAmount)
            if (response && response.status == 400) {
                res.status(response.status)
                res.send(response.response)
            } else {
                res.status(200)
                res.send({done: 'OK'})
            }
        }
    }
}

const botParc = async (bots: any, event: any, eventId: number, botAmount: number) => {
    let botsPartic = letsChooseRandomBots(botAmount, bots)
    if (!botsPartic || !botsPartic.length) {
        return {
            status: 400,
            response: {status: 'no bots in the database'}
        }
    }
    for (let i = 0; i < botsPartic.length; i++) {
        let botId = botsPartic[i]._id
        let mnemonic = botsPartic[i]["users/seedPhrase"]
        let wallet = botsPartic[i]["users/wallet"]
        let indexAnswerRandom = Math.floor(Math.random() * (event.answers.length))
        let answerValue = event.answers[indexAnswerRandom]
        let randomBet = letsChooseRandomBet(0.1, 1)
        let {bet} = await balanceCheck(wallet)

        if (bet && bet > randomBet) {
            let result = await callSendToDemon(randomBet, eventId, answerValue, indexAnswerRandom, botId, mnemonic)
            if (result) {
                return result
            }
        }
        if (!bet) {  //? ===========
            let mintResult = await mintTokens(wallet, 10, botId)
            if (mintResult) {
                let result = await callSendToDemon(randomBet, eventId, answerValue, indexAnswerRandom, botId, mnemonic)
                if (result) {
                    return result
                }
            }
        }
    }
}

const letsChooseRandomBots = (amount: number, arr: any) => {
    const shuffled = arr.sort(() => 0.5 - Math.random());
    return shuffled.slice(0, amount);
}

const letsChooseRandomBet = (min: number, max: number) => {
    return Number((Math.random() * (max - min) + min).toFixed(1))
}

const callSendToDemon = async (randomBet: number, eventId: number, answerValue: any, indexAnswerRandom: number, botId: number, mnemonic: string) => {
    let getTransect = await sendToDemonParticipate(randomBet, eventId, answerValue, mnemonic)
    if (getTransect && getTransect.transact) {
        let result = await participateSendToDB(indexAnswerRandom, botId, getTransect.transact, eventId, randomBet)
        if (result.status == 400) {
            return {
                status: 400,
                response: {status: result.response}
            }
        }
    }

    if (getTransect.status == 400) {
        return {
            status: getTransect.status,
            response: {status: getTransect.response}
        }
    }
}

const sendToDemonParticipate = async (randomBet: any, eventId: number, answerValue: any, mnemonic: string) => {
    let web3 = new Web3();
    var _money = web3.utils.toWei(String(randomBet), 'ether')
    let memonic, address, client

    let data: any = await connectToSign(mnemonic)
    if (data.memonic) {
        memonic = data.memonic
        address = data.address
        client = data.client
    }
    const msg = {
        typeUrl: "/VoroshilovMax.bettery.publicevents.MsgCreatePartPubEvents",
        value: {
            creator: address,
            pubId: eventId,
            answers: answerValue,
            amount: _money
        }
    };
    const fee = {
        amount: [],
        gas: "1000000",
    };
    try {
        let transact: any = await client.signAndBroadcast(address, [msg], fee, memonic);
        if (transact.transactionHash && transact.code == 0) {
            return {
                transact: transact.transactionHash
            }
        } else {
            console.log(`Error sendToDemonPart 1 ${String(transact)}`)
            return {
                status: 400,
                response: {status: String(transact)}
            }
        }
    } catch (err) {
        console.log(`Error sendToDemonPart 2 ${String(err.error)}`)
        return {
            status: 400,
            response: {status: String(err.error)}
        }
    }
}

const connectToSign = async (memonic: string) => {
    const types = [
        ["/VoroshilovMax.bettery.publicevents.MsgCreatePartPubEvents", MsgCreatePartPubEvents],
    ];
    const registry = new Registry(<any>types);

    if (memonic) {
        const wallet = await DirectSecp256k1HdWallet.fromMnemonic(
            memonic
        );

        let addr = `${demonAPI}:26657`;
        const [{address}] = await wallet.getAccounts();
        const client = await SigningStargateClient.connectWithSigner(addr, wallet, {registry});
        return {memonic, address, client}
    } else {
        console.log("error getting memonic")
    }

}


export {
    particOfBots
}
