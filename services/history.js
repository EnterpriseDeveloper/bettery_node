const MongoClient = require('mongodb').MongoClient;
const keys = require("../key");
const _ = require("lodash");
const Web3 = require('web3');

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
                    eventId: eventId,
                    role: "participant"
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

const setReceiveHistory = (contractData, eventId) => {
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

        dbo.collection("questions").findOne({ "id": Number(eventId) }, (err, result) => {
            if (err) {
                console.log("DB error: " + err)
            }

            if (result !== null) {
                // host hostory
                setHistortToUser(result.hostWallet, contractData.persentFeeHost, eventId, dbo, "host")

                // participant history
                let findParticipant = _.filter(result.parcipiantAnswers, function (o) { return o.answer === Number(contractData.correctAnswer); });
                findParticipant.forEach((x) => {
                    setHistortToUser(x.wallet, contractData.monayForParticipant, eventId, dbo, "participant")
                })

                // validate history
                let findValidator = _.filter(result.validatorsAnswers, function (o) { return o.answer === Number(contractData.correctAnswer); });
                findValidator.forEach((x) => {
                    setHistortToUser(x.wallet, contractData.monayForParticipant, eventId, dbo, "validator")
                })
            }else{
                console.log("event not found")            }

            db.close();
        })

    })
}

function setHistortToUser(userWallet, amount, eventId, dbo, role) {

    let money = web3.utils.fromWei(String(amount), 'ether')
    let user = {
        wallet: userWallet
    };

    let history = {
        $push: {
            historyTransaction: {
                date: new Date().getTime(),
                paymentWay: "receive",
                amount: Number(money),
                eventId: Number(eventId),
                role: role
            }
        }
    }

    dbo.collection("users").updateOne(user, history, (err, result) => {
        if (err) {
            res.status(400);
            res.send("error database connection");
            console.log("DB error: " + err)
        }
    })
}

module.exports = {
    setHistory,
    setReceiveHistory
}