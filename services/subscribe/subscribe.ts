const axios = require("axios");
const path = require("../../config/path");

const emailSub = async (req, res) => {
    const create = [{
        "_id": "emailSubscribe$newSub",
        "email": req.body.email,
        "from": req.body.from
    }]

    await axios.post(`${path.path}/transact`, create).catch((err) => {
        res.status(400);
        res.send(err.response.data.message);
        return;
    })
    
    res.status(200);
    res.send({ "status": "ok" });
}

module.exports = {
    emailSub
}