import axios from "axios";
import { path } from "../../config/path";

const reverted = async (data: any) => {
    let eventId = Number(data.id);
    let status = data.purpose;
    let revert = [{
        "_id": eventId,
        "status": "reverted:" + status,
        "eventEnd": Math.floor(new Date().getTime() / 1000.0)
    }]

    await axios.post(`${path}/transact`, revert).catch((err: any) => {
        console.log(err);
        return;
    })
}

export {
    reverted
}