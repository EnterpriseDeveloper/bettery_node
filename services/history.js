const MongoClient = require('mongodb').MongoClient;
const keys = require("../key");

const uri = keys.mongoKey;
const fromDB = "Quize";

const setHistory = (userWallet, amount, path, eventId) => {
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

        let user = {
            wallet: userWallet
        };

        let history = {
            $push: {
                historyTransaction: {
                    date: new Date().getTime(),
                    paymentWay: path,
                    amount: amount,
                    eventId: eventId
                }
            }
        }

        dbo.collection("users").updateOne(user, history, (err, result) => {
            if (err) {
                res.status(400);
                res.send("error database connection");
                console.log("DB error: " + err)
            }
            db.close()
        })
    })
}

module.exports = {
    setHistory
}