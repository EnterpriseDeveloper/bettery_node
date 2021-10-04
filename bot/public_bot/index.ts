import {particOfBots} from "./part_bot";
import { validEventBot } from "./valid_bot";

export default function Public_bot(app: any) {
    app.post( "/participation_of_bots", async (req: any, res:any) => {
        await particOfBots(req, res)
    })

    app.post("/validate_event", async (req: any, res: any) => {
        await validEventBot(req, res)
    })
}
