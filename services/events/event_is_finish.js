const axios = require("axios");
const path = require("../../config/path");


const setCorrectAnswer = async (data) => {

    let finalAnswer = [{
        "_id": Number(data.id),
        "finalAnswerNumber": Number(data.correctAnswer),
        "mintedTokens": Number(data.tokens)
    }]

    return await axios.post(path.path + "/transact", finalAnswer)
        .catch((err) => {
            console.log("DB error: " + err.response.data.message)
        })
}

const eventEnd = async (data) => {
    let finalAnswer = [{
        "_id": Number(data.id),
        "status": "finished",
        "eventEnd": Math.floor(new Date().getTime() / 1000.0)
    }]

    return await axios.post(path.path + "/transact", finalAnswer)
        .catch((err) => {
            console.log("DB error: " + err.response.data.message)
        })
}


module.exports = {
    setCorrectAnswer,
    eventEnd
}