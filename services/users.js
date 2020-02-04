
const MongoClient = require('mongodb').MongoClient;
const keys = require("../key");

const uri = keys.mongoKey;
const fromDB = "Quize";

const registration = (req, res) => {
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
        dbo.collection("users").findOne({ nickName: req.body.nickName }, (err, result) => {
            if (err) {
                res.status(400);
                res.send("error database connection");
                console.log("DB error: " + err)
            }
            if (result === null) {
                let data = {
                    nickName: req.body.nickName,
                    email: req.body.email,
                    wallet: req.body.wallet,
                    listHostEvents: [],
                    listParticipantEvents: [],
                    listValidatorEvents: [],
                    avatar: req.body.avatar
                }
                dbo.collection("users").insertOne(data, function (err, response) {
                    if (err) {
                        res.status(400);
                        res.send("error database connection");
                        console.log("DB error: " + err)
                    }
                    res.status(200).end();
                    db.close();
                });
            } else {
                res.status(400);
                res.send("user already exist");
                db.close();
            }
        })
    });
}

const validate = (req, res) => {
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

        dbo.collection("users").findOne({ wallet: req.body.wallet }, (err, result) => {
            if (err) {
                res.status(400);
                res.send("error database connection");
                console.log("DB error: " + err)
            }
            if (result === null) {
                let data = {
                    nickName: undefined,
                    email: undefined,
                    wallet: undefined
                }

                res.status(200);
                res.send(data);
                db.close();

            } else {
                res.status(200);
                res.send(result);
                db.close();
            }
        })
    });
}

const allUsers = (req, res) => {
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

        dbo.collection("users").find({}).toArray((err, result) => {
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
    registration,
    validate,
    allUsers
}