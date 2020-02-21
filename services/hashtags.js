const axios = require("axios");
const path = require('../config/path')

const getAllHashtags = async (req, res) => {

    let config = {
        "select": ["*"],
        "from": "hashtags"
    }

    let allHashtags = await axios.post(path.path + "/query", config).catch((err) => {
        res.status(400);
        res.send(err.response.data.message);
        console.log("DB error: " + err.response.data.message)
    })

    if (allHashtags.data.length === 0) {
        res.status(200)
        res.send({
            id: "hashtags",
            hashtags: []
        })
    } else {
        res.status(200)
        res.send({
            id: allHashtags.data[0]["_id"],
            hashtags: allHashtags.data[0]['hashtags/hashtags']
        })
    }
}



module.exports = {
    getAllHashtags
}