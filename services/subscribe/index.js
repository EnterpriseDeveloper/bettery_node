const sub = require("./subscribe");

module.exports = app => {
    app.post("/subscribe", async (req, res) => {
        sub.emailSub(req, res);
    })
}