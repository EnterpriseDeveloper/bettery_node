import axios from "axios";
import Web3 from "web3";

import {participateSendToDB} from './publicActivites'
import {path} from "../../config/path";
import {mintTokens} from "../funds/betteryToken";
import {balanceCheck} from "../funds/userTokens";
import {connectToSign} from "../../contract-services/connectToChain";

let particOfBots = async (req: any, res: any) => {
    const eventId = req.body.id
    const botAmount = req.bode.botAmount
    const eventParams = {
        "select": ['answers'],
        "from": eventId, //! change
    }
    const botParams = {
        "select": ["wallet"],
        "where": "users/isBot = true"
    }

    let event = await axios.post(`${path}/query`, eventParams).catch((err)=> {
        res.status(400);
        res.send(err.return.data.message);
        return;
    })

    let bots = await axios.post(`${path}/query`, botParams).catch((err) => {
        res.status(400);
        res.send(err.return.data.message);
        return;
    })

    if(bots && bots.data.length && event && event.data.length){
        let response = await botParc(bots.data, event.data[0], eventId, botAmount)
        if(response) {
            res.status(response.status)
            res.send(response.response)
        }
    }
}

const botParc = async (bots: any, event: any, eventId: number, botAmount: number ) => {
    let botsPartic = letsChooseRandomBots(botAmount, bots)
    if(!botsPartic || !botsPartic.length){
        return {
            status: 400,
            response: {status: 'no bots in the database'}
        }
    }

    for (let i = 0; i < botsPartic.length; i++) {

        let botId = botsPartic[i]._id
        let wallet = botsPartic[i].wallet
        let indexAnswerRandom = Math.floor(Math.random() * (event.answers.length +1))
        let answerValue = event.answers[indexAnswerRandom]
        let randomBet = letsChooseRandomBet (0.1, 1)
        let { bet } = await balanceCheck(wallet)

        if(bet && bet > randomBet){
            let result = await callSendToDemon(randomBet, eventId,answerValue, indexAnswerRandom, botId)

            if(result){
                return result
            }
        }
        if(!bet){
            let mintResult = await mintTokens(wallet, 10, botId )
            if(mintResult){
                let result = await callSendToDemon(randomBet, eventId,answerValue, indexAnswerRandom, botId)

                if(result){
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

const callSendToDemon = async (randomBet: number, eventId: number,answerValue: any, indexAnswerRandom: number, botId: number) => {
    let getTransect = await sendToDemonParticipate(randomBet, eventId, answerValue )
    if(getTransect && getTransect.transact){
        let result = await participateSendToDB(indexAnswerRandom, botId, getTransect.transact, eventId,randomBet)
        if(result.status == 400) {
            return {
                status: 400,
                response: {status: result.response}
            }
        }
    }

    if(getTransect.status == 400){
        return {
            status: getTransect.status,
            response: {status: getTransect.response}
        }
    } else {
        return {
            status: 200,
            response: {status: 'OK'}
        }
    }
}

 const sendToDemonParticipate = async (randomBet: any, eventId: number, answerValue: any) => {
     let web3 = new Web3();
     var _money = web3.utils.toWei(String(randomBet), 'ether')
     let { memonic, address, client } = await connectToSign()

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
         if(transact.transactionHash && transact.code == 0){
             return {
                 transact: transact.transactionHash
             }
         }else{
             console.log(`Error sendToDemonParticipate ${String(transact)}`)
             return {
                 status: 400,
                 response: {status: String(transact)}
             }
         }
     } catch (err) {
         console.log(`Error sendToDemonParticipate ${String(err.error)}`)
         return {
             status: 400,
             response: {status: String(err.error)}
         }
     }
 }

export {
    particOfBots
}
