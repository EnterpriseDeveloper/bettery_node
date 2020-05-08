const axios = require("axios");
const path = require("../config/path");
const contract = require("./holdMoneyDetection");


const deleteEvent = async (req, res) => {
    let id = req.body.id;
    let deleteQuery = [];

    let getEvent = {
        select: ["*", { "events/host": ["users/loomWallet"] }],
        from: id
    }

    let event = await axios.post(path.path + "/query", getEvent)
        .catch((err) => {
            console.log("DB error: " + err.response.data.message)
        })

    if (event.data.length !== 0) {

        // !!! ATTENTION can be a problem if the user will delete the event 
        // after the event is finished, will return one more money from the on-hold contract.
        let loomWallet = event.data[0]['events/host']['users/loomWallet']

        await contract.receiveHoldMoney(loomWallet, id);


        // add event
        deleteQuery.push({
            _id: id,
            _action: "delete"
        })

        // get all invites 
        if (event.data[0]['events/invites'] !== undefined) {
            event.data[0]['events/invites'].forEach((x) => {
                deleteQuery.push({
                    _id: x._id,
                    _action: "delete"
                })
            })
        }

        // get parcipiants activites
        if (event.data[0]['events/parcipiantsAnswer'] !== undefined) {
            event.data[0]['events/parcipiantsAnswer'].forEach((x) => {
                deleteQuery.push({
                    _id: x._id,
                    _action: "delete"
                })
            })
        }

        // get validatos activites
        if (event.data[0]['events/validatorsAnswer'] !== undefined) {
            event.data[0]['events/validatorsAnswer'].forEach((x) => {
                deleteQuery.push({
                    _id: x._id,
                    _action: "delete"
                })
            })
        }

        axios.post(path.path + "/transact", deleteQuery).then(() => {

            res.status(200)
            res.send({ status: "ok" })

        }).catch((err) => {

            res.status(400);
            res.send(err.response.data.message);
            console.log("DB error: " + err.response.data.message)

        })
    }
}

const deleteEventID = (req, res) => {
    let id = Number(req.body.id);
    let deleteData = [{
        "_id": id,
        "_action": "delete"
    }]
    axios.post(path.path + "/transact", deleteData).then(() => {
        res.status(200)
        res.send({ status: "ok" })
    }).catch((err) => {
        res.status(400);
        res.send(err.response.data.message);
        console.log("DB error: " + err.response.data.message)
    })

}


module.exports = {
    deleteEventID,
    deleteEvent
}