import s3 from "../../helpers/S3/s3";

export = (app: any) => {

    app.get("/image/:key", async (req: any, res: any) => {
        const key = req.params.key
        const readStream = s3.getFileStream(key)
        readStream.pipe(res)
    })

}