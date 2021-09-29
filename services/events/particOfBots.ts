import {participateSendToDB} from './publicActivites'
import axios from "axios";
import {demonAPI, path} from "../../config/path";
import {mintTokens} from "../funds/betteryToken";
import Web3 from "web3";

let particOfBots = async (req: any, res: any) => {
    const id = req.body.id
    const botAmount = req.bode.botAmount
    const eventParams = {
        "select": ['answers'],
        "from": 422212465065984,
    }
    const botParams = {
        "select": ["bet"],
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
        console.log(bots.data, 1)
        console.log(event.data, 2)
        // botParc(bots, event, id, botAmount)

        // Math.floor(Math.random() * (answerAmount +1))
    }
}

const botParc = (bots: any, event: any, id: number, botAmount: number ) => {
    let indexRandom = Math.floor(Math.random() * (event.answers.length +1)) //? рандомный ответ
    let botsPartic = letsChooseRandomBots(botAmount, bots)
    let randomBet = letsChooseRandomBet (0.1, 1)

    for (let i = 0; i < botsPartic.length; i++) {
        if(Number(botsPartic[i].bet) > randomBet){
            //todo do bet
        }
        if(Number(botsPartic[i].bet) <= randomBet){
            //todo request more token
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

export {
    particOfBots
}
// mintTokens('cosmos1ngme0tlkmeldygah3405mqp4lcfklv3xdkdhxn',10,351843720888332)

// getTokensIn('cosmos1ngme0tlkmeldygah3405mqp4lcfklv3xdkdhxn',351843720888332)

// particOfBots(null, null)


