const path = require("../config/path");
const axios = require("axios");

const getUserWallet = async (id, res) => {
    let userConfig = {
        "select": ["users/wallet"],
        "from": Number(id)
    }
    let hostDataWallet = await axios.post(`${path.path}/query`, userConfig).catch((err) => {
        console.log("DB error: " + err.response.data.message)
        res.status(400);
        res.send(err.response.data.message);
        return;
    })

    return hostDataWallet.data[0]['users/wallet'];
}

module.exports = {
    getUserWallet
}