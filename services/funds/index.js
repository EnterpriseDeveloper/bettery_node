const setEthPrice = require("./ethPrice");
const withdrawal = require("./withdrawal");


module.exports = app => {
    app.get("/eth_price", async (req, res) => {
        setEthPrice.getEthPrice(req, res);
    })

    app.post("/withdrawal/init", async (req, res) => {
        withdrawal.setInitWithd(req, res);
    })
}