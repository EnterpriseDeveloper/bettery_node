import {
    validEventBot, 
    chooseBots,
    checkEventTime,
    countTrueAnswers,
    setToNetworkValidation 
} from '../valid_bot';

describe('Test validate_event endpoint', () => {
    jest.setTimeout(300000);
    
    const nowTime = Math.floor(Date.now() / 1000);
    const checkEventTimeData = [
        {
            input: nowTime + 1000, output: {
                status: 400,
                response: { status: 'Event time is not over' }
            }
        },
        { input: nowTime - 1000, output: undefined},
        { input: nowTime, output: undefined }
    ]
    test('test checkEventTime func', () => {
        checkEventTimeData.forEach((testObject) => {
            const checkEventTimeRes = checkEventTime(testObject.input)
            expect(checkEventTimeRes).toStrictEqual(testObject.output)
        })
    })


    const countTrueAnswersData = [
        { input: 10, output: 6 },
        { input: 1, output: 1 },
        { input: 47, output: 28 },
        { input: 37492, output: 22495 },
        {
            input: 0, output: {
                status: 400,
                response: { status: 'Number of valids < 1' }
            } },
        {
            input: -26, output: {
                status: 400,
                response: { status: 'Number of valids < 1' }
            } 
        }
    ]
    test('test countTrueAnswers func', () => {
        countTrueAnswersData.forEach((testObject) => {
            const countTrueAnswersRes = countTrueAnswers(testObject.input)
            expect(countTrueAnswersRes).toStrictEqual(testObject.output)
        })
    })


    const validEventBotData = [
        { 
            input: {
                body:{
                    id: 12345678,
                    answer: 1
                }   
            }, 
            output:  {
                status: 400,
                send: 'Event id is invalid'
            }
        },
        {
            input: {
                body: {
                    id: 422212465066027,
                    answer: 1
                }
            },
            output: {
                status: 400,
                send: 'Event is valid'
            }
        }, 
        {
            input: {
                body: {
                    id: 422212465066006,
                    answer: 1
                }
            },
            output: {
                status: 400,
                send: 'Event status is reverted or finished'
            }
        },
        {
            input: {
                body: {
                    id: 422212465066006,
                    answer: -1
                }
            },
            output: {
                status: 400,
                send: 'Answer number is invalid'
            }
        },
        {
            input: {
                body: {
                    id: 422212465066006,
                    answer: 15
                }
            },
            output: {
                status: 400,
                send: 'Answer number is invalid'
            }
        }
    ]
    test('test validEventBot func',async () => {
        for (let testObject of validEventBotData){
            const funcRes = {
                status: 0,
                send: ''
            }
            const res = {
                status: (numb: number) => funcRes.status = numb,
                send: (value: string) => funcRes.send = value
            }

            await validEventBot(testObject.input, res)   
            expect(funcRes).toStrictEqual(testObject.output)
        }
    })

    
    const setToNetworkValidationData = {
        input:{
            reput: 1, 
            eventId: 422212465066006,
            answerValue: "gbgfb",
            mnemonic: "gorilla wet shove require video market rhythm person moral sock wolf ride panda occur buddy ship man refuse act mass phone repeat basket wedding"
        },
        output: {  
            "response": {
                "status": "[object Object]",
            },
            "status": 400, 
        }
    }                
    test('test setToNetworkValidation func', async () => {
        const setToNetworkValidationRes = await setToNetworkValidation(setToNetworkValidationData.input.reput, setToNetworkValidationData.input.eventId, setToNetworkValidationData.input.answerValue, setToNetworkValidationData.input.mnemonic)
        expect(setToNetworkValidationRes).toStrictEqual(setToNetworkValidationData.output)
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
    const chooseBotsData = [
        {
            input:{
                numberOfValids: 5, 
                answers: [], 
                checkEventValid: false
            }
        },
        {
            input: {
                numberOfValids: 4,
                answers: [{
                    from: {
                        "_id": 351843720888431
                    }
                }],
                checkEventValid: true
            },
            output: [{
                status: 400,
                response: 'Event was validated'
            }]
        }
    ]
    test('test chooseBots func 1', () => {
        let testObject = chooseBotsData[0]
            const chooseBotsRes = chooseBots(bots, testObject.input.numberOfValids, testObject.input.answers, testObject.input.checkEventValid)
            expect(chooseBotsRes).toHaveLength(testObject.input.numberOfValids)
        
    })
    test('test chooseBots func 2', () => {
        let testObject = chooseBotsData[1]
        const chooseBotsRes = chooseBots(bots, testObject.input.numberOfValids, testObject.input.answers, testObject.input.checkEventValid)
        expect(chooseBotsRes).toStrictEqual(testObject.output)

    })
});