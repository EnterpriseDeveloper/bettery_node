import axios from 'axios';

import { path } from "../../config/path";

const validEventBot = async (req: any, res: any) => {
    const eventId = req.body.id;
    const answer = req.body.answer;

    const eventParams = {
        "select": ['answers', 'endTime', 'status', 'validatorsAmount', 'validatorsAnswer'],
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

        const numberOfValids = eventData.validatorsAmount - eventData.validatorsAnswer.length

        const choosenBots = chooseBots(bots.data, numberOfValids, eventData.validatorsAnswer)
        const trueAnswers = countTrueAnswers(numberOfValids)





        

    } else {
        res.status(400)
        res.send('Event id is invalid')
        return;
    } 
}

const chooseBots = (botsData: any, numberOfValids: number, answers:any) => {
    const botsForValidate: any[] = [];

    const checkAnswersId = (botId: number) => {
        for (let answer of answers) {
            if (botId == answer._id){
                return false
            }
        }
        return true
    }

    const checkChoosenBotsId = (botId: number) => {
        for (let botForValidate of botsForValidate) {
            if (botId == botForValidate._id) {
                return false
            }
        }
        return true
    }

    for (let i = 0; i < numberOfValids;) {
        const botIndex = Math.floor(Math.random() * botsData.length)

        const answersResponse = checkAnswersId(botsData[botIndex]._id)

        if (answersResponse) {
            if (botsForValidate[0]){  
                const choosenBotsResponse = checkChoosenBotsId(botsData[botIndex]._id)
                if (choosenBotsResponse) {
                    botsForValidate.push(botsData[botIndex])
                    i++   
                }
            } else {
                botsForValidate.push(botsData[botIndex])
                i++
            }                
        }
    }

    return botsForValidate;       
}

const checkEventTime = (endTime: number) => {
    const nowTime = Math.floor(Date.now() / 1000);
    if (endTime < nowTime) {
        return {
            status: 400,
            response: { status: 'Event time is over' }
        }
    }
    return;
}

const countTrueAnswers = (numberOfValids: number) => {
    if (numberOfValids == 1){
        return [1, 0]
    }
    const trueAnswers = Math.floor((numberOfValids / 10) * 6);
    const falseAnswers = numberOfValids - trueAnswers

    return [trueAnswers, falseAnswers]  
}


export {
    validEventBot
}

