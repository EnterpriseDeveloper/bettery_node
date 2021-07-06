import axios from "axios";
import { path } from "../../config/path";

const sendTokens = async (req: any, res: any) => {
    if (req.body.dataFromRedis.id && req.body.bet && req.body.bty) {
        let data = [{
            "_id": Number(req.body.dataFromRedis.id),
            "bet": Number(req.body.bet),
            "bty": Number(req.body.bty),
            "lastUpdate": Math.floor(Date.now() / 1000)
        }]

        axios.post(path + "/transact", data).then(() => {
            res.status(200);
            res.send({ "status": "done" })
        }).catch((err: any) => {
            res.status(400);
            res.send(err.response.data.message);
        })

        return
    }
    res.status(400)
    res.send({ status: "Bad request 400" })
}


export {
    sendTokens
}
