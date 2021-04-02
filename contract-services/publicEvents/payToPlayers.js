const PlayerPaymentContract = require("../abi/PlayerPayment.json");
const ContractInit = require("../contractInit");

const url = require("../../config/path");
const axios = require('axios');
const _ = require('lodash');

const payToPlayers = async (data) => {
    console.log("from payToPlayers", data)
    let id = data.id;

    let expertPercMint = data.expertPercMint
    let percent = data.percent
    let expertPremiumPerc = data.expertPremiumPerc

    let params = {
        "select": [
            "publicEvents/mintedTokens",
            "publicEvents/premiumTokens",
            "publicEvents/finalAnswerNumber",
            "publicEvents/premium",
            {
                "publicEvents/validatorsAnswer": [
                    "publicActivites/answer",
                    {
                        "publicActivites/from": [
                            "users/_id",
                            "users/reputation"
                        ]
                    }
                ]
            },
            {
                "publicEvents/parcipiantsAnswer": [
                    "publicActivites/answer",
                    "publicActivites/amount"
                ]
            }
        ],
        "from": Number(id)
    }
    let allData = await axios.post(`${url.path}/query`, params).catch(err => {
        console.log("DB error in 'payToPlayers': " + err.response.data.message)
        return
    })

    let mintedTokens = allData.data[0]['publicEvents/mintedTokens'];
    let premiumTokens = allData.data[0]['publicEvents/premiumTokens'];
    let correctAnswer = allData.data[0]['publicEvents/finalAnswerNumber'];

    let {rightValidators, forSendReputation} = calculateReput(allData, correctAnswer)


    let amountLoserToken = calculateLoserPool(allData, correctAnswer)

    let allReputation = calculateAllReput(rightValidators)


    let payToValidators = [];

    for (let i = 0; i < rightValidators.length; i++) {
        let reputation = rightValidators[i]['publicActivites/from']['users/reputation']
        if (reputation === undefined) {
            reputation = 0
        }

        let amountMint = expertPercMint * mintedTokens * (reputation + 1) / allReputation / 100

        let payToken = amountLoserToken * percent * (reputation + 1) / allReputation / 100

        let premiumAmount

        if (allData.data[0]['publicEvents/premium']) {
            premiumAmount = premiumTokens * expertPremiumPerc * (reputation + 1) / allReputation / 100
        }
        let obj = {
            "_id": Number(rightValidators[i]._id),
            "mintedToken": amountMint,
            "payToken": payToken,
            "premiumToken": premiumAmount === undefined ? 0 : premiumAmount
        }
        payToValidators.push(obj)
    }

    sendToDb(payToValidators.concat(forSendReputation))

    // TODO add prodaction
    let path = "test" // process.env.NODE_ENV
    let contract = await ContractInit.init(path, PlayerPaymentContract);
    try {
        let gasEstimate = await contract.methods.letsPayToPlayers(id).estimateGas();
        await contract.methods.letsPayToPlayers(id).send({
            gas: gasEstimate,
            gasPrice: 0
        });

    } catch (err) {
        console.log("err from pay to players", err)
    }
}

let sendToDb = async (result) => {
    await axios.post(url.path + "/transact", result).catch((err) => {
        console.log("error in payToPlayers: " + err.response.statusText)
    })
    console.log("payToPlayers works")
}

const calculateReput = (allData, correctAnswer) => {
    let allValidators = allData.data[0]['publicEvents/validatorsAnswer']
    let forSendReputation = []
    let rightValidators = []

    for (let i = 0; i < allValidators.length; i++) {
        let rep = allValidators[i]['publicActivites/from']['users/reputation'] == undefined ? 0 : allValidators[i]['publicActivites/from']['users/reputation']

        if (correctAnswer === allValidators[i]["publicActivites/answer"]) {
            rightValidators.push(allValidators[i]);
            let x = {
                "_id": Number(allValidators[i]['publicActivites/from']._id),
                "reputation": Number(rep + 1),
            }
            forSendReputation.push(x)
        } else {
            let x = {
                "_id": Number(allValidators[i]['publicActivites/from']._id),
                "reputation": Number(rep - 2),
            }
            forSendReputation.push(x)
        }
    }
    return {
        forSendReputation,
        rightValidators
    }
}

const calculateLoserPool = (allData, correctAnswer) => {
    let allParticipants = allData.data[0]['publicEvents/parcipiantsAnswer'];

    let sort = _.filter(allParticipants, (x) => {
        return x['publicActivites/answer'] != correctAnswer
    })
    return _.reduce(sort, (sum, n) => {
        return sum + Number(n['publicActivites/amount'])
    }, 0)
}

const calculateAllReput = (rightValidators) => {
    return  _.reduce(rightValidators, (sum, n) => {
        let rep = n['publicActivites/from']['users/reputation']
        if (rep === undefined) {
            rep = 0
        }
        return sum + Number(rep + 1)
    }, 0)
}

module.exports = {
    payToPlayers
}
