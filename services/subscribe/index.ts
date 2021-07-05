import sub from "./subscribe";

export = (app:any) => {
    app.post("/subscribe", async (req: any, res: any) => {
        sub.emailSub(req, res);
    })
}