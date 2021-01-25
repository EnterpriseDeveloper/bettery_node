const auth = require("./users");
const torusRegist = require("./torusRegist");
const myActivites = require("./myActivites");

module.exports = app => {
    app.post("/user/validate", async (req, res) => {
        auth.validate(req, res);
    })

    app.post("/user/getUserById", async (req, res) => {
        auth.getUserById(req, res);
    })

    app.post("/user/regist", async (req, res) => {
        auth.registration(req, res);
    })

    app.get("/user/all", async (req, res) => {
        auth.allUsers(req, res);
    })

    app.post("/user/torus_regist", async (req, res) => {
        torusRegist.torusRegist(req, res)
    })

    app.post("/my_activites/invites", async (req, res) => {
        myActivites.getAllInvites(req, res);
    })
}