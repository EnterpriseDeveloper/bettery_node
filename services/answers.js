const MongoClient = require('mongodb').MongoClient;
const keys = require("../key");
const history = require("./history");

const uri = keys.mongoKey;
const fromDB = "Quize";

const setAnswer = (req, res) => {
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

        if (req.body.multy) {
            setMultyAnswer(dbo, db, req, res)
        } else {
            setOneAnswer(dbo, db, req, res)
        }

    })
}

const setMultyAnswer = (dbo, db, req, res) => {
    let quantity = req.body.multyAnswer.length;
    req.body.multyAnswer.forEach((x, i) => {
        let from = req.body.from === "participant" ? "parcipiantAnswers" : "validatorsAnswers";

        let question = {
            id: req.body.event_id
        };

        let answer = {
            $push: {
                [from]: {
                    date: req.body.date,
                    answer: x,
                    transactionHash: req.body.transactionHash,
                    wallet: req.body.wallet,
                }
            }
        }


        dbo.collection("questions").updateOne(question, answer, (err, result) => {
            if (err) {
                res.status(400);
                res.send("error database connection");
                console.log("DB error: " + err)
            }
            if (i + 1 === quantity) {
                setQuantityAnswer(dbo, db, req, res, from)
            }
        })
    });

}

const setOneAnswer = (dbo, db, req, res) => {
    let from = req.body.from === "participant" ? "parcipiantAnswers" : "validatorsAnswers";

    let question = {
        id: req.body.event_id
    };

    let answer = {
        $push: {
            [from]: {
                date: req.body.date,
                answer: req.body.answer,
                transactionHash: req.body.transactionHash,
                wallet: req.body.wallet,
            }
        }
    }


    dbo.collection("questions").updateOne(question, answer, (err, result) => {
        if (err) {
            res.status(400);
            res.send("error database connection");
            console.log("DB error: " + err)
        }
        dbo.collection("questions").findOne({ "id": req.body.event_id }, (err, result) => {
            if (err) {
                res.status(400);
                res.send("error database connection");
                console.log("DB error: " + err)
            }
            setQuantityAnswer(dbo, db, req, res, from)

            if(result.length !== 0){
                history.setHistory(req.body.wallet, result.money, "send", req.body.event_id)
            }
        })
    })
}

const setQuantityAnswer = (dbo, db, req, res, from) => {
    var to = from === "parcipiantAnswers" ? "answerQuantity" : "validatorsQuantity";
    let question = {
        id: req.body.event_id
    };

    let answer = {
        $set: {
            [to]: req.body[to]
        }
    }


    dbo.collection("questions").updateOne(question, answer, (err, result) => {
        if (err) {
            res.status(400);
            res.send("error database connection");
            console.log("DB error: " + err)
        }
        res.status(200);
        res.send({ done: "ok" });
        db.close()
    })
}


module.exports = {
    setAnswer
}