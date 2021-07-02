const PlayerPaymentContract = require("../../abi/PlayerPayment.json");
const ContractInit = require("../../contractInit");
const url = require("../../../config/path");
const axios = require('axios');
const getNonce = require("../../nonce/nonce");
const getGasPrice = require("../../gasPrice/getGasPrice")
const config = require("../../../config/limits")

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
                    "publicActivites/expertReput",
                    {
                        "publicActivites/from": [
                            "users/_id",
                            "users/expertReputPoins"
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

    let { rightValidators, forSendReputation } = calculateReput(allData, correctAnswer)


    let amountLoserToken = calculateLoserPool(allData, correctAnswer)

    let allReputation = calculateAllReput(rightValidators)


    let payToValidators = [];

    if (allReputation > 0) {
        for (let i = 0; i < rightValidators.length; i++) {
            let reputation = rightValidators[i]['publicActivites/expertReput'] == undefined ? 0 : rightValidators[i]['publicActivites/expertReput'];
            let amountMint = 0;
            if (mintedTokens > 0) {
                amountMint = expertPercMint * mintedTokens * (reputation + 1) / allReputation / 100
            }

            let payToken = amountLoserToken * percent * (reputation + 1) / allReputation / 100

            let premiumAmount = 0;

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
    } else {
        // TODO add to db percent of expert to the Marketing Fund 
        console.log("ALL validators have minus reputation");
    }

    await sendToDb(payToValidators.concat(forSendReputation))

    let path = process.env.NODE_ENV
    let contract = await ContractInit.init(path, PlayerPaymentContract);
    try {
        let gasEstimate = await contract.methods.letsPayToPlayers(id).estimateGas();
        await contract.methods.letsPayToPlayers(id).send({
            gas: Number((((gasEstimate * config.gasPercent) / 100) + gasEstimate).toFixed(0)),
            gasPrice: await getGasPrice.getGasPriceSafeLow(),
            nonce: await getNonce.getNonce()
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
        let rep = allValidators[i]['publicActivites/from']['users/expertReputPoins'] == undefined ? 0 : allValidators[i]['publicActivites/from']['users/expertReputPoins']

        if (correctAnswer === allValidators[i]["publicActivites/answer"]) {
            if (rep >= 0) {
                rightValidators.push(allValidators[i]);
            }
            let x = {
                "_id": Number(allValidators[i]['publicActivites/from']._id),
                "expertReputPoins": Number(rep + 1),
            }
            forSendReputation.push(x)
        } else {
            let x = {
                "_id": Number(allValidators[i]['publicActivites/from']._id),
                "expertReputPoins": Number(rep - 2),
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
    let allPar = allData.data[0]['publicEvents/parcipiantsAnswer'];

    let sum = 0;
    for (let i = 0; i < allPar; i++) {
        if (allPar[i]['publicActivites/answer'] != correctAnswer) {
            sum = sum + Number(allPar[i]['publicActivites/amount'])
        }
    }
    return sum;
}

const calculateAllReput = (rightValidators) => {
    let total = 0;

    rightValidators.forEach((num) => {
        let exRep = num['publicActivites/expertReput'] == undefined ? 0 : num['publicActivites/expertReput'];
        if (exRep >= 0) {
            total += exRep + 1
        }
    });
    return Number(total)
}

module.exports = {
    payToPlayers
}
