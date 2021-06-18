const auth = require("./users");
const torusRegist = require("./torusRegist");
const myActivites = require("./myActivites");
const linkAccount = require("../../helpers/auth0/linkAccount");
const authMiddleware = require("../../middlewares/check-token");

module.exports = app => {
    app.post("/user/getUserById", authMiddleware, async (req, res) => {
        auth.getUserById(req, res);
    })

    app.get("/user/all", async (req, res) => {
        auth.allUsers(req, res);
    })

    app.post("/user/torus_regist", async (req, res) => {
        torusRegist.torusRegist(req, res)
    })

    app.post("/user/event_activites", async (req, res) => {
        await myActivites.getAllUserEvents(req, res);
    })

    app.post("/user/get_additional_info", async (req, res) => {
        await auth.additionalInfo(req, res)
    })

    app.post("/user/link_account", authMiddleware, async (req, res) => {
        await linkAccount.linkAccount(req, res);
    })

    app.post("user/update_nickname",authMiddleware, async (req, res) => {
        await auth.updateNickname(req, res)
    })

    app.get("/user/delete_account", async (req, res) => {
        // TODO
        res.status(200);
        res.send({ status: "ok" })
    })
}
