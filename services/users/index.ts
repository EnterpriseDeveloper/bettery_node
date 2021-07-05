import auth from "./users";
import torusRegist from "./torusRegist";
import myActivites from "./myActivites";
import linkAccount from "../../helpers/auth0/linkAccount";
import authMiddleware from "../../middlewares/check-token";

export = (app: any) => {
    app.post("/user/getUserById", authMiddleware, async (req: any, res: any) => {
        auth.getUserById(req, res);
    })

    app.get("/user/all", async (req: any, res: any) => {
        auth.allUsers(req, res);
    })

    app.post("/user/torus_regist", async (req: any, res: any) => {
        torusRegist.torusRegist(req, res)
    })

    app.post("/user/event_activites", async (req: any, res: any) => {
        await myActivites.getAllUserEvents(req, res);
    })

    app.post("/user/get_additional_info", async (req: any, res: any) => {
        await auth.additionalInfo(req, res)
    })

    app.post("/user/link_account", authMiddleware, async (req: any, res: any) => {
        await linkAccount.linkAccount(req, res);
    })

    app.post("/user/update_nickname", authMiddleware, async (req: any, res: any) => {
        await auth.updateNickname(req, res)
    })

    app.post("/user/update_public_email", authMiddleware, async (req: any, res: any) => {
        await auth.updatePublicEmail(req, res)
    })

    app.post("/user/auto_login", async (req: any, res: any) => {
        await torusRegist.autoLogin(req, res);
    })

    app.get("/user/logout", authMiddleware, async (req: any, res: any) => {
        await torusRegist.logout(req, res);
    })

    app.get("/user/delete_account", async (req: any, res: any) => {
        // TODO
        res.status(200);
        res.send({ status: "ok" })
    })
}
