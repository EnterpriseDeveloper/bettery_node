const MongoClient = require('mongodb').MongoClient;
const fromDB = "Quize";
const keys = require("../key");

const uri = keys.mongoKey;


const deleteEvent = (req, res) => {

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

        let event = {
            id: Number(req.body.id)
        };

        dbo.collection("questions").deleteOne(event, (err, obj) => {
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
    deleteEvent
}