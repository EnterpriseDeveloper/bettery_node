import withdrawal from "./withdrawal";
import bettertToken from './betteryToken';
import userTokens from './userTokens'
import checkToken from '../../middlewares/check-token';

export = (app: any) => {

    app.post("/withdrawal/init", async (req: any, res: any) => {
        withdrawal.setInitWithd(req, res);
    })

    app.get("/withdrawal/exit", checkToken, async (req: any, res: any) => {
        withdrawal.setInitWithd(req, res);
    })

    app.post("/tokens/bty", async (req: any, res: any) => {
        bettertToken.getBTYToken(req, res);
    })

    app.post("/users/updateBalance", checkToken, async (req: any, res: any) => {
        userTokens.sendTokens(req, res);
    })
}
