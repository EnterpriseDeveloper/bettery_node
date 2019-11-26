const MongoClient = require('mongodb').MongoClient;
const keys = require("../key");

const uri = keys.mongoKey;
const fromDB = "Quize";

const getAllActivites = (req, res) => {
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
        let activites = [];

        dbo.collection("users").findOne({ wallet: req.body.wallet }, async (err, result) => {
            if (err) {
                res.status(400);
                res.send("error database connection");
                console.log("DB error: " + err)
            }
            if (result.listHostEvents.length !== 0) {
                let active = await this.getActivites(result.listHostEvents, dbo, res, "Host");
                active.forEach(element => {
                    activites.push(element)
                });
            }
            if (result.listParticipantEvents.length !== 0) {
                let active = await this.getActivites(result.listParticipantEvents, dbo, res, "Participant");
                active.forEach(element => {
                    activites.push(element)
                });
            }
            if (result.listValidatorEvents.length !== 0) {
                let active = await this.getActivites(result.listValidatorEvents, dbo, res, "Validator");
                active.forEach(element => {
                    activites.push(element)
                });
            }

            res.status(200);
            res.send(activites);
            db.close();

        })


    })
}

getActivites = (data, dbo, res, from) => {
    let id = data.map((x) => {
        return x.event
    })
    return new Promise(resolve => {
        dbo.collection('questions').find({ "id": { "$in": id } }).toArray((err, result) => {
            if (err) {
                res.status(400);
                res.send("error database connection");
                console.log("DB error: " + err)
            }

            for (i in result) {
                result[i].from = from;
            }

            resolve(result)
        })
    })

}

module.exports = {
    getAllActivites
}

