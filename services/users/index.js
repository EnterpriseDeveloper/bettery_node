const auth = require("./users");
const torusRegist = require("./torusRegist");
const myActivites = require("./myActivites");

module.exports = app => {
    app.post("/user/getUserById", async (req, res) => {
        auth.getUserById(req, res);
    })

    app.get("/user/all", async (req, res) => {
        auth.allUsers(req, res);
    })

    app.post("/user/torus_regist", async (req, res) => {
        torusRegist.torusRegist(req, res)
    })

    app.post("/user/event_activites", async (req, res) =>{
        await myActivites.getAllUserEvents(req, res);
    })

    app.get("/user/delete_account", async (req, res) =>{
        // TODO
        res.status(200);
        res.send({status: "ok"})
    })
}