const axios = require("axios");
const Contract = require("../contract/contract");
const key = require("../key");
const Web3 = require("web3");

const setEthPriceToContract = async () => {
    // get Price
    let data = await axios.get("https://min-api.cryptocompare.com/data/price?fsym=ETH&tsyms=USD&api_key=" + key.apiKey)
        .catch((err) => console.log(err))
    let price = data.data.USD * 100;

    let web3 = new Web3();
    let toWei = web3.utils.toWei(String(price), "ether");

    // conntect to contract
    let contr = new Contract.Contract();
    let getContract = await contr.loadContract();

    // ETH price
    // Token price
    let test = await getContract.methods.setEthPrice(toWei, toWei).send();
    console.log(test);

    setInterval(() => {
        setEthPriceToContract();
    }, 3 * 60 * 60 * 1000)
}

const getEthPrice = async (req, res) => {
    let data = await axios.get("https://min-api.cryptocompare.com/data/price?fsym=ETH&tsyms=USD&api_key=" + key.apiKey)
        .catch((err) => {
            res.status(400);
            res.send(err.response.data.message);
            console.log("get eth price error: " + err.response.data.message)
        })

    let price = data.data.USD

    res.status(200)
    res.send({ price: price})
}

module.exports = {
    setEthPriceToContract,
    getEthPrice
}