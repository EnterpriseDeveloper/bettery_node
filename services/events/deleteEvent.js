const axios = require("axios");
const path = require("../../config/path");

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
    deleteEventID
}