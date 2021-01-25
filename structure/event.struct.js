const publicEventStructure = (data) => {
    return data.map((z) => {
        return {
            answerAmount: z["publicEvents/parcipiantsAnswer"] === undefined ? 0 : z["publicEvents/parcipiantsAnswer"].length,
            startTime: z['publicEvents/startTime'],
            id: z._id,
            hashtags: z['publicEvents/hashtags'],
            host: {
                id: z['publicEvents/host']["_id"],
                nickName: z['publicEvents/host']['users/nickName'],
                avatat: z['publicEvents/host']['users/avatar'],
                wallet: z['publicEvents/host']['users/wallet']
            },
            validated: z['publicEvents/validated'],
            status: z['publicEvents/status'],
            answers: z['publicEvents/answers'],
            money: z['publicEvents/money'],
            finalAnswer: z['publicEvents/finalAnswerNumber'] === undefined ? null : z['publicEvents/finalAnswerNumber'],
            validatorsAmount: z["publicEvents/validatorsAnswer"] === undefined ? 0 : z["publicEvents/validatorsAnswer"].length,
            endTime: z['publicEvents/endTime'],
            transactionHash: z['publicEvents/transactionHash'],
            question: z['publicEvents/question'],
            eventEnd: z['publicEvents/eventEnd'] === undefined ? 0 : z['publicEvents/eventEnd'],
            currencyType: z['publicEvents/currencyType'] === undefined ? false : z['publicEvents/currencyType'],
            parcipiantAnswers: z["publicEvents/parcipiantsAnswer"] === undefined ? undefined : z["publicEvents/parcipiantsAnswer"].map((par) => {
                return {
                    transactionHash: par['publicActivites/transactionHash'],
                    date: par['publicActivites/date'],
                    answer: par['publicActivites/answer'],
                    userId: par['publicActivites/from']['_id'],
                    amount: par['publicActivites/amount'],
                    avatar: par['publicActivites/from']['users/avatar'],
                }
            }),
            validatorsAnswers: z["publicEvents/validatorsAnswer"] === undefined ? undefined : z["publicEvents/validatorsAnswer"].map((val) => {
                return {
                    transactionHash: val['publicActivites/transactionHash'],
                    date: val['publicActivites/date'],
                    answer: val['publicActivites/answer'],
                    userId: val['publicActivites/from']['_id'],
                    avatar: val['publicActivites/from']['users/avatar'],
                }
            }),
            room: {
                id: z['publicEvents/room'][0]['_id'],
                name: z['publicEvents/room'][0]['room/name'],
                color: z['publicEvents/room'][0]['room/color'],
                owner: z['publicEvents/room'][0]['room/owner']['_id']
            }
        }
    })
}

const privateEventStructure = (data) => {
    return data.map((z) => {
        return {
            winner: z['privateEvents/winner'],
            loser: z['privateEvents/loser'],
            startTime: z['privateEvents/startTime'],
            endTime: z['privateEvents/endTime'],
            transactionHash: z['privateEvents/transactionHash'],
            id: z._id,
            status: z['privateEvents/status'],
            question: z['privateEvents/question'],
            answers: z["privateEvents/answers"],
            host: {
                id: z['privateEvents/host']["_id"],
                nickName: z['privateEvents/host']['users/nickName'],
                avatat: z['privateEvents/host']['users/avatar'],
                wallet: z['privateEvents/host']['users/wallet']
            },
            finalAnswer: z["privateEvents/finalAnswer"],
            finalAnswerNumber: z["privateEvents/finalAnswerNumber"],
            parcipiantAnswers: z["privateEvents/parcipiantsAnswer"] === undefined ? undefined : z["privateEvents/parcipiantsAnswer"].map((par) => {
                return {
                    transactionHash: par['privateActivites/transactionHash'],
                    date: par['privateActivites/date'],
                    answer: par['privateActivites/answer'],
                    userId: par['privateActivites/from']['_id'],
                    avatar: par['privateActivites/from']['users/avatar'],
                    role: par['privateActivites/role']
                }
            }),
            validatorAnswer: z["privateEvents/validatorAnswer"] === undefined ? undefined : {
                transactionHash: z['privateEvents/validatorAnswer']['privateActivites/transactionHash'],
                date: z['privateEvents/validatorAnswer']['privateActivites/date'],
                answer: z['privateEvents/validatorAnswer']['privateActivites/answer'],
                userId: z['privateEvents/validatorAnswer']['privateActivites/from']['_id'],
                avatar: z['privateEvents/validatorAnswer']['privateActivites/from']['users/avatar'],
                role: z['privateEvents/validatorAnswer']['privateActivites/role'],
                nickName: z['privateEvents/validatorAnswer']['privateActivites/from']['users/nickName'],
            },
            room: {
                name: z['privateEvents/room'][0]['room/name'],
                color: z['privateEvents/room'][0]['room/color'],
                owner: z['privateEvents/room'][0]['room/owner']['_id']
            }
        }
    })
}

module.exports = {
    publicEventStructure,
    privateEventStructure
}