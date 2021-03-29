const keys = require("./key");

let ip = process.env.NODE_ENV == "production" ? keys.APIprod : keys.APItest;
const path = `http://${ip}/fdb/demo/quize`;

module.exports = {
    path
}