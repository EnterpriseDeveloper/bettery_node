const axios = require("axios");
const path = require("../config/path");
const _ = require("lodash");

const demoSmartContract = async (data) => {
    let allData = []
    let totalAmount;
    let persentHost = 3;
    let persentValidator = 5;
    let eventData = data.data[0];
    let eventPrice = Number(data.data[0]["events/money"]);
    let answerAmount = eventData["events/answers"].length;

    let correctAnswer = findCorrectAnswer(eventData["events/validatorsAnswer"], answerAmount);
    console.log("correct answer: " + correctAnswer)

    let participant = _.filter(eventData["events/parcipiantsAnswer"], (x) => { return x["activites/currencyType"] == "demo" });

    if (participant.length !== 0) {
        totalAmount = eventPrice * participant.length;

        // let's pay fee for host 
        let perHost = percentCalculate(totalAmount, persentHost);
        totalAmount = totalAmount - perHost;
        allData.push({
            "_id": eventData["events/host"]["_id"],
            fakeCoins: Number(eventData["events/host"]["users/fakeCoins"]) + perHost
        })

        // let's pay for validators
        let validators = _.filter(eventData["events/validatorsAnswer"], (x) => {
           return x["activites/answer"] === correctAnswer
        })

        if (validators.length !== 0) {
            let findPercentForValidators = percentCalculate(totalAmount, persentValidator);
            totalAmount = totalAmount - findPercentForValidators;
            let forEachValidator = findPercentForValidators / validators.length;
            for (let i = 0; i < validators.length; i++) {
                allData.push({
                    "_id": validators[i]["activites/from"]["_id"],
                    fakeCoins: Number(validators[i]["activites/from"]["users/fakeCoins"]) + forEachValidator
                })
            }
        }

        // let's pay for participant
        let partic = _.filter(eventData["events/parcipiantsAnswer"], (x) => {
            return x["activites/currencyType"] === "demo" && x["activites/answer"] === correctAnswer
        });
        let forEachParticipant = totalAmount / partic.length;
        for (let i = 0; i < partic.length; i++) {
            allData.push({
                "_id": partic[i]["activites/from"]["_id"],
                fakeCoins: partic[i]["activites/from"]["users/fakeCoins"] + forEachParticipant
            })
        }

        console.log(allData);


    }
}

const findCorrectAnswer = (data, answerAmount) => {
    let biggestValue = 0;
    let biggestIndex = 0;
    for (let i = 0; i < answerAmount; i++) {
        let answer = _.filter(data, (x)=>{return x['activites/answer'] === i});
        if (answer.length > biggestIndex) {
            biggestIndex = answer.length
            biggestValue = i
        }
    }
    return biggestValue;
}

const percentCalculate = (amount, percent) => {
    return Number(((amount * percent) / 100).toFixed(4));
}

module.exports = {
    demoSmartContract
}