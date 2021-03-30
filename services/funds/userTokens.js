const axios = require("axios");
const path = require("../../config/path");

const sendTokens = async (req, res) => {
    if (req.body.id && req.body.bet && req.body.bty) {
        let data = [{
            "_id": Number(req.body.id),
            "bet": Number(req.body.bet),
            "bty": Number(req.body.bty),
            "lastUpdate": Math.floor(Date.now() / 1000)
        }]

        axios.post(path.path + "/transact", data).then(()=>{
            res.status(200);
            res.send({ "status": "done" })
        }).catch((err)=>{
            res.status(400);
            res.send(err.response.data.message);
        })

        return
    }
    res.status(400)
    res.send({status: "Bad request 400"})
}


module.exports = {
    sendTokens
}
