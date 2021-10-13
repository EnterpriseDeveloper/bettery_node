import axios from 'axios';

import { demonAPI, path } from "../../config/path";
import { validateCendToDB } from '../../services/events/publicActivites';
import { DirectSecp256k1HdWallet, Registry } from "@cosmjs/proto-signing";
import { MsgCreateValidPubEvents } from "../../contract-services/publicEvents/tx";
import { SigningStargateClient } from '@cosmjs/stargate';

const validEventBot = async (req: any, res: any) => {
    const eventId = req.body.id;
    const trueAnswerNumber = req.body.answer;

    const eventParams = {
        "select": ['answers', 'endTime', 'status', 'validatorsAmount', 'validatorsAnswer', { "publicEvents/parcipiantsAnswer": ["from"] }],
        "from": eventId,
    }
    const botParams = {
        "select": ["_id", "expertReputPoins", "seedPhrase"],
        "where": "users/isBot = true"
    }

    const event = await axios.post(`${path}/query`, eventParams).catch((err) => {
        res.status(400);
        res.send(err.toJSON().message);
        return;
    })
    const bots = await axios.post(`${path}/query`, botParams).catch((err) => {
        res.status(400);
        res.send(err.toJSON().message);
        return;
    })

    if (event && event.data[0] && bots) {
        const eventData = event.data[0]

        if (eventData.validatorsAnswer == undefined){
            eventData.validatorsAnswer = []
        }

        if (trueAnswerNumber >= eventData.answers.length) {
            res.status(400)
            res.send('Answer number is invalid')
            return;
        }

        const endTimeRes = checkEventTime(eventData.endTime)
        if (endTimeRes && endTimeRes.status === 400){
            res.status(endTimeRes.status)
            res.send(endTimeRes.response)
            return;
        }

        if (eventData.validatorsAnswer.length >= eventData.validatorsAmount){
            res.status(400)
            res.send('Event is valid')
            return;
        }

        if (eventData.status !== 'finished' && eventData.status !== 'deployed') {
            res.status(400)
            res.send('Event status is reverted or cancel')
            return;
        }

        const numberOfValids = eventData.validatorsAmount - eventData.validatorsAnswer.length

        const choosenBots = chooseBots(bots.data, numberOfValids, eventData['publicEvents/parcipiantsAnswer'])
        if (choosenBots && choosenBots[0].status){
            res.status(choosenBots[0].status)
            res.send(choosenBots[0].response)
            return;
        }
        const trueAnswers = countTrueAnswers(numberOfValids)

        const firstValidBotRes = await firstValidBot(choosenBots[0], eventData, eventId, trueAnswerNumber)
        if (firstValidBotRes && firstValidBotRes.status) {
            res.status(firstValidBotRes.status)
            res.send(firstValidBotRes.response)
            if (firstValidBotRes.status === 400) {
                return;
            }
        }

        setTimeout (async () => {

            const eventAfterTimeout = await axios.post(`${path}/query`, eventParams).catch((err) => {
                res.status(400);
                res.send(err.toJSON().message);
                return;
            })
            if (eventAfterTimeout && eventAfterTimeout.data[0]) {

                if (eventAfterTimeout.data[0].status !== 'finished' && eventAfterTimeout.data[0].status !== 'deployed') {
                    res.status(400)
                    res.send('Event status is reverted or cancel')
                    return;
                }

                const startValidateRes = await startValidate(choosenBots, trueAnswers, eventData, eventId, trueAnswerNumber)
                
                if (startValidateRes && startValidateRes.status === 400) {
                    res.status(startValidateRes.status)
                    res.send(startValidateRes.response)
                    return;
                }

            } else {
                res.status(400)
                res.send('Event id is invalid')
                return;
            }

        }, 120000)

    } else {
        res.status(400)
        res.send('Event id is invalid')
        return;
    }
}

const startValidate = async (choosenBots: any, trueAnswers: any, eventData: any, eventId: any, trueAnswerNumber: any) => {
    for (let i = 1; i < choosenBots.length; i++) {

        if (i < trueAnswers) {
            const answerValue = eventData.answers[trueAnswerNumber]
            const getTransect = await setToNetworkValidation(choosenBots[i].expertReputPoins, eventId, answerValue, choosenBots[i].seedPhrase)
            
            if (getTransect && getTransect.transact) {
                validateCendToDB(eventId, choosenBots[i]._id, choosenBots[i].expertReputPoins, getTransect.transact, trueAnswerNumber)
            } else {
                return {
                    status: getTransect.status,
                    response: getTransect.response
                }
            }

        } else {
            const falseAnswerNumber = Math.floor(Math.random() * eventData.answers.length)
            const answerValue = eventData.answers[falseAnswerNumber]
            const getTransect = await setToNetworkValidation(choosenBots[i].expertReputPoins, eventId, answerValue, choosenBots[i].seedPhrase)
                        
            if (getTransect && getTransect.transact) {
                validateCendToDB(eventId, choosenBots[i]._id, choosenBots[i].expertReputPoins, getTransect.transact, falseAnswerNumber)
            } else {
                return {
                    status: getTransect.status,
                    response: getTransect.response
                }
            }
        }
    }
}

const firstValidBot = async (choosenBot: any, eventData: any, eventId: any, trueAnswerNumber: any) => {
    const answerValue = eventData.answers[trueAnswerNumber]
    const getTransect = await setToNetworkValidation(choosenBot.expertReputPoins, eventId, answerValue, choosenBot.seedPhrase)

    if (getTransect && getTransect.transact) {
        validateCendToDB(eventId, choosenBot._id, choosenBot.expertReputPoins, getTransect.transact, trueAnswerNumber)
        return {
            status: 200,
            response: 'Validation started'
        }
    } else {
        return {
            status: getTransect.status,
            response: getTransect.response
        }
    }
}

const shuffle = (array: any[]) => {
    for (let i = array.length - 1; i > 0; i--) {
        let j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
    return array
}

const chooseBots = (botsData: any, numberOfValids: number, answers: any) => {
    let botsForValidate: any[] = [];

    for (let answer of answers) {
        for (let bot of botsData) {
            if (answer.from._id !== bot._id) {
                if (bot.expertReputPoins == undefined) {
                    bot.expertReputPoins = 0
                }
                botsForValidate.push(bot)
            } else {
                return [{
                    status: 400,
                    response: 'Event was validated'
                }]
            }
        }
    }

    botsForValidate = shuffle(botsForValidate)
    botsForValidate = botsForValidate.slice(0, numberOfValids)

    return botsForValidate;
}


const checkEventTime = (endTime: number) => {
    const nowTime = Math.floor(Date.now() / 1000);
    if (endTime > nowTime) {
        return {
            status: 400,
            response: { status: 'Event time is not over' }
        }
    }
    return;
}

const countTrueAnswers = (numberOfValids: number) => {
    if (numberOfValids == 1){
        return 1
    }
    const trueAnswers = Math.floor((numberOfValids / 10) * 6);

    return trueAnswers
}

const setToNetworkValidation = async (reput: any, eventId: number, answerValue: any, mnemonic: string) => {
    let memonic, address, client

    let data: any = await connectToSign(mnemonic)
    if (data.memonic) {
        memonic = data.memonic
        address = data.address
        client = data.client
    }
    const msg = {
        typeUrl: "/VoroshilovMax.bettery.publicevents.MsgCreateValidPubEvents",
        value: {
            creator: address,
            pubId: eventId,
            answers: answerValue,
            reput
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
                response: { status: String(transact) }
            }
        }
    } catch (err: any) {
        console.log(`Error sendToDemonPart 2 ${String(err.error)}`)
        return {
            status: 400,
            response: { status: String(err.error) }
        }
    }
}

const connectToSign = async (memonic: string) => {
    const types = [
        ["/VoroshilovMax.bettery.publicevents.MsgCreateValidPubEvents", MsgCreateValidPubEvents],
    ];
    const registry = new Registry(<any>types);

    if (memonic) {
        const wallet = await DirectSecp256k1HdWallet.fromMnemonic(
            memonic
        );

        let addr = `${demonAPI}:26657`;
        const [{ address }] = await wallet.getAccounts();
        const client = await SigningStargateClient.connectWithSigner(addr, wallet, { registry });
        return { memonic, address, client }
    } else {
        console.log("error getting memonic")
    }

}

export {
    validEventBot
}

