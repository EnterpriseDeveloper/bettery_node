const axios = require("axios");
const path = require("../config/path")


const inviteUsers = (data, allData, role) => {
    return data.map((x, i) => {
        return {
            _id: role === "Participant" ? "invites$par" + i : "invites$valid" + i,
            status: "invited",
            role: role,
            from: allData.host,
            date: Math.floor(Date.now() / 1000),
            transactionHash: allData.transactionHash,
            eventId: allData._id
        }
    })

}

const deleteInvitation = (req, res) => {

    let conf = [{
        "_id": req.body.id,
        "_action": "delete"
    }]

    axios.post(path.path + "/transact", conf).then(() => {
        res.status(200);
        res.send({ deleted: 'ok' });
    }).catch((err) => {
        console.log("DB error: " + err.response.data.message)
        res.status(400);
        res.send(err.response.data.message);
    })
}

module.exports = {
    inviteUsers,
    deleteInvitation
}