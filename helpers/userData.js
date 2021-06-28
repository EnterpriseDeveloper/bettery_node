const path = require("../config/path");
const axios = require("axios");
const reputationConvert = require("../helpers/reputationConvert")

const getUserReput = async (id, res) => {
    let userConfig = {
        "select": ["users/expertReputPoins"],
        "from": Number(id)
    }
    let hostDataWallet = await axios.post(`${path.path}/query`, userConfig).catch((err) => {
        console.log("DB error: " + err.response.data.message)
        res.status(400);
        res.send(err.response.data.message);
        return;
    })

    return reputationConvert(hostDataWallet.data[0]['users/expertReputPoins']);
}

module.exports = {
    getUserReput
}
