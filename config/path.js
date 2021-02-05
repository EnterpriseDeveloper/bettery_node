let ip = process.env.NODE_ENV == "production" ? "13.212.36.199:8080" : "54.255.205.9:8080";
const path = `http://${ip}/fdb/demo/quize`;

module.exports = {
    path
}