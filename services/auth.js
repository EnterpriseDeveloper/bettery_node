
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
        dbo.collection("users").findOne({ email: req.body.email }, (err, result) => {
            if (err) {
                res.status(400);
                res.send("error database connection");
                throw err;
            }
            if (result === null) {
                let data = {
                    email: req.body.email,
                    password: req.body.password,
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

const login = (req, res) => {
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

        dbo.collection("users").findOne({ email: req.body.email }, (err, result) => {
            if (err) {
                res.status(400);
                res.send("error database connection");
                throw err;
            }
            if (result === null) {

                res.status(400);
                res.send("user not found");
                db.close();

            } else {
                if (result.password !== req.body.password) {
                    res.status(400);
                    res.send("password not correct");
                    db.close();
                } else {
                    let data = {
                        email: result.email,
                        password: result.password,
                        wallet: result.wallet
                    }
                    res.status(200);
                    res.send(data);
                    db.close();
                }
            }
        })
    });
}

module.exports = {
    registration,
    login
}