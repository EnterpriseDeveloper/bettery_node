const MongoClient = require('mongodb').MongoClient;
const keys = require("../key");
const helpers = require("../helpers/helpers");

const uri = keys.mongoKey;
const fromDB = "Quize";

const getAllHashtags = (req, res) => {
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

        dbo.collection("hashtags").find({}).toArray((err, result) => {
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

const updateHashtags = (hash, res, dbo) => {
    dbo.collection("hashtags").find({}).toArray((err, result) => {
        if (err) {
            res.status(400);
            res.send("error database connection");
            console.log("DB error: " + err)
        }
        if (result.length === 0) {

            let hashtags = {
                hashtags: hash
            };

            dbo.collection("hashtags").insertOne(hashtags, (err, result) => {
                if (err) {
                    res.status(400);
                    res.send("error database connection");
                    console.log("DB error: " + err)
                }
            })
        } else {
            let id = {
                _id: result[0]._id
            }
            let hashtags = {
                $set: {
                    hashtags: helpers.arrayUnique(result[0].hashtags.concat(hash))
                }
            };
            dbo.collection("hashtags").updateOne(id, hashtags, function (err, res) {
                if (err) {
                    res.status(400);
                    res.send("error database connection");
                    console.log("DB error: " + err)
                }
            });
        }
    })
}

module.exports = {
    getAllHashtags,
    updateHashtags
}