const MongoClient = require('mongodb').MongoClient;
const keys = require("../key");

const uri = keys.mongoKey;
const fromDB = "Quize";

const setQuestion = (req, res) => {
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

        let data = req.body;

        dbo.collection("questions").insertOne(data, (err, result) => {
            if (err) {
                res.status(400);
                res.send("error database connection");
                console.log("DB error: " + err)
            }

            res.status(200);
            res.send(result);
            db.close();

        })
    });
}

module.exports = {
    setQuestion
}