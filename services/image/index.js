const s3 = require("../../helpers/S3/s3");

module.exports = app => {

    app.get("/image/:key", async (req, res) => {
        const key = req.params.key
        const readStream = s3.getFileStream(key)
        readStream.pipe(res)
    })

}