const axios = require("axios");
const url = require("../../config/path");

const reverted = async (data) => {
    let eventId = Number(data.id);
    let status = data.purpose;
    let revert = [{
        "_id": eventId,
        "status": "reverted:" + status,
        "eventEnd": Math.floor(new Date().getTime() / 1000.0)
    }]

    await axios.post(`${url.path}/transact`, revert).catch((err) => {
        console.log(err);
        return;
    })
}

module.exports = {
    reverted
}