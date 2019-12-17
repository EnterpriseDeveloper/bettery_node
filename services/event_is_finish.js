const MongoClient = require('mongodb').MongoClient;
const fromDB = "Quize";
const keys = require("../key");

const uri = keys.mongoKey;


const setCorrectAnswer = (data, id) => {
    MongoClient.connect(uri, {
        useNewUrlParser: true,
        useUnifiedTopology: true
    }, function (err, db) {
        if (err) {
            res.status(400);
            res.send("error database connection");
            console.log("DB error: " + err)
        }
        let dbo = db.db(fromDB);

        let question = {
            id: Number(id)
        };

        let correctAnswer = {
            $set: {
                finalAnswers: Number(data.correctAnswer)
            }
        };

        dbo.collection("questions").updateOne(question, correctAnswer, (err, result) => {
            if (err) {
                console.log("DB error: " + err)
            }
        })
    })

}


module.exports = {
    setCorrectAnswer
}