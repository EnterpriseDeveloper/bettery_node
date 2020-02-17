const MongoClient = require('mongodb').MongoClient;
const keys = require("../key");

const uri = keys.mongoKey;
const fromDB = "Quize";

const axios = require("axios");
const path = require("../config/path")


const inviteUsers = (data, allData, role ) => {
    return data.map((x, i) => {
        return {
            _id: role === "Parcipiant" ? "invites$par" + i : "invites$valid" + i,
            status: "invited",
            role: role,
            from: allData.host,
            date: Math.floor(Date.now() / 1000),
            transactionHash: allData.transactionHash,
            eventId: allData._id
        }
    })

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
    inviteUsers,
    deleteInvitation
}