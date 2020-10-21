const setEthPrice = require("./ethPrice");
const withdrawal = require("./withdrawal");
const bettertToken = require('./betteryToken');


module.exports = app => {
    app.get("/eth_price", async (req, res) => {
        setEthPrice.getEthPrice(req, res);
    })

    app.post("/withdrawal/init", async (req, res) => {
        withdrawal.setInitWithd(req, res);
    })

    app.post("/tokens/bty", async (req, res) => {
        bettertToken.getBTYToken(req, res);
    })
}