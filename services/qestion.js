const MongoClient = require('mongodb').MongoClient;
const keys = require("../key");
const hashtags = require("./hashtags");
const invites = require('./invites');

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

        invites.addToHost(req.body, res, dbo)

        // add new hashtags
        if (req.body.hashtags.length !== 0) {
            hashtags.updateHashtags(req.body.hashtags, res, dbo)
        }

        // invite parcipiant
        if (req.body.parcipiant.length !== 0) {
            invites.inviteParcipiant(req.body, res, dbo)
        }

        // invite validators
        if (req.body.validators.length !== 0) {
            invites.inviteValidators(req.body, res, dbo)
        }

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

const getById = (req, res) => {
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

        let id = req.body.id;

        dbo.collection("questions").findOne({ "id": id }, (err, result) => {
            if (err) {
                res.status(400);
                res.send("error database connection");
                console.log("DB error: " + err)
            }
            if (result === null) {
                let data = {
                    id: undefined
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

const getAll = (req, res) => {
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

        dbo.collection("questions").find({ private: false }).toArray((err, result) => {
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
    setQuestion,
    getById,
    getAll
}