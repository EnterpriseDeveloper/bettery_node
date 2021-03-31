const path = require("../config/path");
const axios = require("axios");

const getUserWallet = async (id, res) => {
    let userConfig = {
        "select": ["users/wallet", "users/reputation"],
        "from": Number(id)
    }
    let hostDataWallet = await axios.post(`${path.path}/query`, userConfig).catch((err) => {
        console.log("DB error: " + err.response.data.message)
        res.status(400);
        res.send(err.response.data.message);
        return;
    })

    let reput = hostDataWallet.data[0]['users/reputation'];
    return {
        wallet: hostDataWallet.data[0]['users/wallet'],
        reputation: reput == undefined ? 0 : reput
    };
}

module.exports = {
    getUserWallet
}