const historyQuize = require("./historyQuize");


module.exports = app => {

    app.post("/history_quize/get_by_id", async (req, res) => {
        historyQuize.historyQuizeById(req, res);
    })

}