import { analytics24h, analyticsByEventId } from "./analitics";

export default function Analytics(app: any) {

   app.get('/analytics/full', async (req: any, res: any) => {
       await analytics24h(req, res)
   })

    app.post('/analytics/eventById', async (req: any, res: any) => {
        await analyticsByEventId(req, res)
    })
}
