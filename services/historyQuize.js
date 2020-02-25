const axios = require('axios');
const path = require('../config/path');
const _ = require("lodash");

const historyQuizeById = async (req, res) => {
    let id = req.body.id;

    let data = {
        "history": Number(id),
        "pretty-print": true
    }

    let time = {
        "select": ["?number", "?instant"],
        "where": [
            ["?block", "_block/number", "?number"],
            ["?block", "_block/instant", "?instant"]
        ]
    }

    let blocktime = await axios.post(path.path + "/query", time).catch((err) => {
        res.status(400);
        res.send(err.response.data.message);
        console.log("DB error: " + err.response.data.message)
    })

    let allHistory = await axios.post(path.path + "/history", data).catch((err) => {
        res.status(400);
        res.send(err.response.data.message);
        console.log("DB error: " + err.response.data.message)
    })

    if (allHistory.status === 200 && blocktime.status === 200) {
        let sortByBlock = _.sortBy(allHistory.data, [function (o) { return o.block; }]);
        let obj = sortByBlock.map((z, i) => {
            let getTime = _.find(blocktime.data, (o) => { return o[0] === z.block })
            return {
                time: getTime[1],
                action: getAction(z, i)
            }
        })
        getAdditionalData(obj, res)

    }
}

async function getAdditionalData(obj, res) {
    let activitesId = obj.map((x) => {
        if (Number(x.action) === x.action) {
            return x.action
        }
    })
    let additionalData = {
        "select": ["*", { "activites/from": ["users/nickName"] }],
        "from": _.filter(activitesId, (x) => { return x !== undefined })
    }

    let activitesData = await axios.post(path.path + "/query", additionalData).catch((err) => {
        res.status(400);
        res.send(err.response.data.message);
        console.log("DB error: " + err.response.data.message)
    })

    if (activitesData.status === 200) {
        let allData = obj.map((x) => {
            return {
                time: x.time,
                action: getFinalAction(x, activitesData.data),
                from: getFrom(x, activitesData.data)
            }
        })

        res.status(200);
        res.send(allData);

    }
}

function getFrom(data, activitesData) {
    if (Number(data.action) === data.action) {
        let findActivites = _.find(activitesData, (x) => { return x._id === data.action })
        return findActivites['activites/from']['users/nickName']
    } else {
        return 'host'
    }
}

function getFinalAction(data, activitesData) {
    if (Number(data.action) === data.action) {
        let findActivites = _.find(activitesData, (x) => { return x._id === data.action })
        return findActivites['activites/role']
    } else {
        return data.action
    }
}

function getAction(data, index) {
    switch (index) {
        case 0:
            return "created id";
        case 1:
            return "created event"
        default:
            return data.flakes.asserted[0]['events/parcipiantsAnswer'] === undefined
                ? data.flakes.asserted[0]['events/validatorsAnswer'][0]["_id"]
                : data.flakes.asserted[0]['events/parcipiantsAnswer'][0]["_id"]
    }
}


module.exports = {
    historyQuizeById
}