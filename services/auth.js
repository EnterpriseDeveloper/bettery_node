
const MongoClient = require('mongodb').MongoClient;

const uri = 'mongodb+srv://hiThere:hithere123456@cluster0-ddoj5.mongodb.net/test?retryWrites=true&w=majority'

const registration = (req, res) => {
    MongoClient.connect(uri, {
        useNewUrlParser: true,
        useUnifiedTopology: true
    }, function (err, db) {
        if (err) {
            res.status(400);
            res.send("error database connection");
            throw err;
        }
        let dbo = db.db("Quize");
        dbo.collection("users").findOne({ nickName: req.body.nickName }, (err, result) => {
            if (err) {
                res.status(400);
                res.send("error database connection");
                throw err;
            }
            if (result === null) {
                let data = {
                    nickName: req.body.nickName,
                    email: req.body.email,
                    wallet: req.body.wallet
                }
                dbo.collection("users").insertOne(data, function (err, response) {
                    if (err) {
                        res.status(400);
                        res.send("error database connection");
                        throw err;
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
            throw err;
        }
        let dbo = db.db("Quize");

        dbo.collection("users").findOne({ wallet: req.body.wallet }, (err, result) => {
            if (err) {
                res.status(400);
                res.send("error database connection");
                throw err;
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

module.exports = {
    registration,
    validate
}