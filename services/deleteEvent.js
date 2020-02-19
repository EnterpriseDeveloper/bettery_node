const axios = require("axios");
const path = require("../config/path");


const deleteEvent = async (req, res) => {
    let id = req.body.id;
    let deleteQuery = [];

    let getEvent = {
        select: ["*"],
        from: id
    }

    let event = await axios.post(path.path + "/query", getEvent)
        .catch((err) => {
            console.log("DB error: " + err.response.data.message)
        })

    if (event !== undefined) {

        // add event
        deleteQuery.push({
            _id: id,
            _action: "delete"
        })

        // get all invites 
        if (event.data['events/invites'] !== undefined) {
            event.data['events/invites'].forEach((x) => {
                deleteQuery.push({
                    _id: x._id,
                    _action: "delete"
                })
            })
        }

        // get parcipiants activites
        if (event.data['events/parcipiantsAnswer'] !== undefined) {
            event.data['events/parcipiantsAnswer'].forEach((x) => {
                deleteQuery.push({
                    _id: x._id,
                    _action: "delete"
                })
            })
        }

        // get validatos activites
        if (event.data['events/validatorsAnswer'] !== undefined) {
            event.data['events/validatorsAnswer'].forEach((x) => {
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


module.exports = {
    deleteEvent
}