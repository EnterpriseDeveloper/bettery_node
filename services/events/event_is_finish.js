const axios = require("axios");
const path = require("../../config/path");


const setCorrectAnswer = (data, id) => {

    let finalAnswer = [{
        "_id": Number(id),
        "finalAnswerNumber": Number(data.correctAnswer),
        "eventEnd": Math.floor(new Date().getTime() / 1000.0)
    }]

    axios.post(path.path + "/transact", finalAnswer)
        .catch((err) => {
            console.log("DB error: " + err.response.data.message)
        })
}


module.exports = {
    setCorrectAnswer
}