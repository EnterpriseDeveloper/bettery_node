import {
    part_bot,
    callSendToDemon,
    checkEndTime,
    letsChooseRandomBots
} from '../part_bot';

describe('Test part_bot endpoint', () => {
    jest.setTimeout(300000);
    
    const part_botData = [
        { 
            input: {
                body:{
                    id: 12345678,
                    botAmount: 0
                }   
            }, 
            output:  {
                status: 400,
                send: { message: "enter the correct number of bots ( bots > 0 && bots <= 150)" }
            }
        },
        {
            input: {
                body: {
                    id: '12345678',
                    botAmount: "10"
                }
            },
            output: {
                status: 400,
                send: { message: "enter the correct number of bots ( bots > 0 && bots <= 150)" }
            }
        },
        {
            input: {
                body: {
                    id: 12345678,
                    botAmount: 10
                }
            },
            output: {
                status: 400,
                send: { message: "id not correct " }
            }
        },
        {
            input: {
                body: {
                    id: 422212465066038,
                    botAmount: 10
                }
            },
            output: {
                status: 400,
                send: { message: 'bots have already been applied for this event' }
            }
        }, 
        {
            input: {
                body: {
                    id: 422212465066006,
                    botAmount: 1
                }
            },
            output: {
                status: 400,
                send: { message: 'the time for participation in the event has expired, or there is less than 45 minutes left' }
            }
        }
    ]
    test('test part_bot func',async () => {
        for (let testObject of part_botData){
            const funcRes = {
                status: 0,
                send: ''
            }
            const res = {
                status: (numb: number) => funcRes.status = numb,
                send: (value: string) => funcRes.send = value
            }
    
            await part_bot(testObject.input, res)
            expect(funcRes).toStrictEqual(testObject.output)
        }
    })
    
    
    const bots = [
        {
            "_id": 351843720888553,
            "expertReputPoins": 5
        },
        {
            "_id": 351843720888458
        },
        {
            "_id": 351843720888492,
            "expertReputPoins": -1
        },
        {
            "_id": 351843720888420
        },
        {
            "_id": 351843720888411,
            "expertReputPoins": 1
        },
        {
            "_id": 351843720888431
        }
    ]
    test('test letsChooseRandomBots func', () => {
        const letsChooseRandomBotsRes = letsChooseRandomBots(4, bots)
        expect(letsChooseRandomBotsRes).toHaveLength(4)
    })

    
    const nowTime = Math.floor(Date.now() / 1000);
    const checkEndTimeData = [
        { input: nowTime + 2700000, output: true },
        { input: nowTime + 2800000, output: true },
        { input: nowTime, output: false }
    ]
    test('test checkEndTime func', () => {
        checkEndTimeData.forEach((testObject) => {
            const checkEndTimeRes = checkEndTime(testObject.input)
            expect(checkEndTimeRes).toStrictEqual(testObject.output)
        })
    })


    const callSendToDemonData = [
        {
            input:{
                randomBet: 0.1,
                eventId: 422212465066006,
                answerValue: "gbgfb",
                indexAnswerRandom: 1,
                botId: 351843720888586,
                mnemonic: "gorilla wet shove require video market rhythm person moral sock wolf ride panda occur buddy ship man refuse act mass phone repeat basket wedding"
            },
            output: {  
                "status": 400, 
            }
        },
        {
            input: {
                randomBet: 0.02,
                eventId: 12345,
                answerValue: -18,
                indexAnswerRandom: 1,
                botId: 351843720888586,
                mnemonic: "gorilla wet shove require video market rhythm person moral sock wolf ride panda occur buddy ship man refuse act mass phone repeat basket wedding"
            },
            output: {
                "status": 400,
            }
        }, 
        {
            input: {
                randomBet: 0.02,
                eventId: 422212465066006,
                answerValue: "gbgfb",
                indexAnswerRandom: -1,
                botId: 23456,
                mnemonic: "gorilla wet shove require video market rhythm person moral sock wolf ride panda occur buddy ship man refuse act mass phone repeat basket wedding"
            },
            output: {
                "status": 400,
            }
        },
        
    ]               
    test('test callSendToDemon func', async () => {
        for (let value of callSendToDemonData) {
            const callSendToDemonRes = await callSendToDemon(value.input.randomBet, value.input.eventId, value.input.answerValue, value.input.indexAnswerRandom, value.input.botId, value.input.mnemonic)
            expect(callSendToDemonRes?.status).toStrictEqual(value.output.status)
        }

    })
});