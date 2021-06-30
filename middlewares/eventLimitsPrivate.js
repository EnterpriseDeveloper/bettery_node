const axios = require('axios');
const path = require("../config/path");
const config = require('../config/limits');

module.exports = async (req, res, next) => {
    let userID = req.body.dataFromRedis.id;
    let prodDev = req.body.prodDev

    let query = {
        "select": ["*"],
        "where": `privateEvents/host = ${Number(userID)}`,
        "from": "privateEvents"
    }

    let data = await axios.post(`${path.path}/query`, query).catch((err) => {
        res.status(400);
        res.send(err.response.data.message);
        console.log("DB error: " + err.response.data.message)
        return;
    })

    // let's find finised answer

    let filterData = data.data.filter((x)=>{return x['privateEvents/finalAnswer'] == ''});
    if(filterData.length >= config.limit && prodDev){
        res.status(400);
        res.send("Limit is reached");
        return;
    }

    next();
};
