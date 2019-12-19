const MongoClient = require('mongodb').MongoClient;
const keys = require("../key");

const uri = keys.mongoKey;
const fromDB = "Quize";

const addToHost = (data, res, dbo) => {
    let hostWallet = data.hostWallet
    let event_id = data.id
    let transactionHash = data.transactionHash

    let user = { wallet: hostWallet };
    let newInvites = {
        $push: {
            listHostEvents: {
                event: event_id,
                transactionHash: transactionHash,
                date: Number((new Date().getTime() / 1000).toFixed(0))
            }
        }
    }

    dbo.collection("users").updateOne(user, newInvites, (err, result) => {
        if (err) {
            res.status(400);
            res.send("error database connection");
            console.log("DB error: " + err)
        }
    })
}


const inviteParcipiant = (data, res, dbo) => {
    let parcipiant = data.parcipiant
    let event_id = data.id
    let transactionHash = data.transactionHash
    parcipiant.forEach(wallet => {

        let user = { wallet: wallet };
        let newInvites = {
            $push: {
                listParticipantEvents: {
                    event: event_id,
                    transactionHash: transactionHash,
                    date: Number((new Date().getTime() / 1000).toFixed(0))
                }
            }
        }

        dbo.collection("users").updateOne(user, newInvites, (err, result) => {
            if (err) {
                res.status(400);
                res.send("error database connection");
                console.log("DB error: " + err)
            }
        })
    });
}

const inviteValidators = (data, res, dbo) => {
    let validators = data.validators
    let event_id = data.id
    let transactionHash = data.transactionHash
    validators.forEach(wallet => {

        let user = { wallet: wallet };
        let newInvites = {
            $push: {
                listValidatorEvents: {
                    event: event_id,
                    transactionHash: transactionHash,
                    date: Number((new Date().getTime() / 1000).toFixed(0))
                }
            }
        }

        dbo.collection("users").updateOne(user, newInvites, (err, result) => {
            if (err) {
                res.status(400);
                res.send("error database connection");
                console.log("DB error: " + err)
            }
        })
    });
}

module.exports = {
    addToHost,
    inviteParcipiant,
    inviteValidators
}