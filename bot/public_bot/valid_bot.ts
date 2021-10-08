import axios from 'axios';

import { path } from "../../config/path";
import { validateCendToDB }  from '../../services/events/publicActivites';

const validEventBot = async (req: any, res: any) => {
    const eventId = req.body.id;
    const trueAnswerNumber = req.body.answer;

    const eventParams = {
        "select": ['answers', 'endTime', 'status', 'validatorsAmount', 'validatorsAnswer', { "publicEvents/parcipiantsAnswer": ["from"] }],
        "from": eventId,
    }
    const botParams = {
        "select": ["_id"],
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

    if (event && event.data[0] && bots) {
        const eventData = event.data[0]


        if (eventData.validatorsAmount == undefined){
            eventData.validatorsAmount = []
        }

        if (trueAnswerNumber >= eventData.answers.length) {
            res.status(400)
            res.send('Answer number is invalid')
            return;
        }

        const endTimeRes = checkEventTime(eventData.endTime)
        if(endTimeRes && endTimeRes.status === 400){
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
        const trueAnswers = countTrueAnswers(numberOfValids)

        for (let i = 0; i < choosenBots.length; i++) {
            if (i < trueAnswers) {
                // validateCendToDB(eventId, choosenBots[i]._id,  ,  , trueAnswerNumber)
            } else {
                let falseAnswerNumber
                for (let index = 0; index < 1;) {
                    falseAnswerNumber = Math.floor(Math.random() * eventData.answers.length)
                    if (falseAnswerNumber !== trueAnswerNumber) {
                        index++
                    }
                }
                // validateCendToDB(eventId, choosenBots[i]._id,  ,  , trueAnswerNumber)
            }
        }

    } else {
        res.status(400)
        res.send('Event id is invalid')
        return;
    } 
}

const shuffle = (array: any[]) => {
    for (let i = array.length - 1; i > 0; i--) {
        let j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
    return array
}

const chooseBots = (botsData: any, numberOfValids: number, answers:any) => {
    let botsForValidate: any[] = [];
    
    for (let answer of answers) {
        for (let bot of botsData) {
            if (answer.from._id !== bot._id) {
              botsForValidate.push(bot)
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










export {
    validEventBot
}

