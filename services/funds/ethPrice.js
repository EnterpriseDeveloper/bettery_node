const axios = require("axios");
const key = require("../../config/key");

const getEthPrice = async (req, res) => {
    let data = await axios.get("https://min-api.cryptocompare.com/data/price?fsym=ETH&tsyms=USD&api_key=" + key.apiKey)
        .catch((err) => {
            res.status(400);
            res.send(err.response.data.message);
            console.log("get eth price error: " + err.response.data.message)
        })

    let price = data.data.USD

    res.status(200)
    res.send({ price: price })
}

module.exports = {
    getEthPrice
}