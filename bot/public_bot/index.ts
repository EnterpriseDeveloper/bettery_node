import {particOfBots} from "./part_bot";

export default function Public_bot(app: any) {
    app.post( "/participation_of_bots", async (req: any, res:any) => {
        await particOfBots(req, res)
    })
    }
