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

const deleteInvitation = (req, res) =>{
    MongoClient.connect(uri, {
        useNewUrlParser: true,
        useUnifiedTopology: true
    }, (err, db) => {
        if (err) {
            res.status(400);
            res.send("error database connection");
            console.log("DB error: " + err)
        }
        let dbo = db.db(fromDB);

        let user = { wallet: req.body.wallet };
        let deleteInvites = {
            $pull: {
                [req.body.from]: {
                    event: Number(req.body.id)
                }
            }
        }

        console.log(user)
        console.log(deleteInvites)

        dbo.collection("users").updateOne(user, deleteInvites, (err, obj) => {
            if (err){
                res.status(400);
                res.send("error database connection");
                console.log("DB error: " + err)
            }

            res.status(200);
            res.send({deleted: 'ok'});
            db.close();
        })
    })

}

module.exports = {
    addToHost,
    inviteParcipiant,
    inviteValidators,
    deleteInvitation
}