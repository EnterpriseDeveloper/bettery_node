import { analytics24h, analyticsByEventId } from "./analitics";

export default function Analytics(app: any) {

   app.post('/analytics_ById', async (req: any, res: any) => {
       await analytics24h(req, res)
   })

    app.get('/full_analytics', async (req: any, res: any) => {
        await analyticsByEventId(req, res)
    })
}
