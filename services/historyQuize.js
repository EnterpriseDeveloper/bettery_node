const axios = require('axios');
const path = require('../config/path');
const _ = require("lodash");

const historyQuizeById = async (req, res) => {
    let id = req.body.id;

    let data = {
        "history": Number(id),
        "prettyPrint": true
    }

    let allHistory = await axios.post(path.path + "/history", data).catch((err) => {
        res.status(400);
        res.send(err.response.data.message);
        console.log("DB error: " + err.response.data.message)
    })

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

    if (allHistory.status === 200 && blocktime.status === 200) {

        let sortByBlock = _.sortBy(allHistory.data, [function (o) { return o.block; }]);
        let obj = sortByBlock.map((z, i) => {
            let getTime = _.find(blocktime.data, (o) => { return o[0] === z.block })
            return {
                time: getTime[1],
                action: getAction(z, i)
            }
        })
        getAdditionalData(obj, allHistory, res)

    }
}

async function getAdditionalData(obj, allHistory, res) {
    let hostId = undefined

    let activitesId = obj.map((x) => {
        if (Number(x.action) === x.action) {
            return x.action
        }
    })

    // get host id
    let findHost = _.find(allHistory.data, (x) => { return x.asserted[0]["events/host"] !== undefined });
    if (findHost !== undefined) {
        hostId = findHost.asserted[0]["events/host"]["_id"]
        activitesId.push(hostId)
    }

    let additionalData = {
        "select": ["*", { "activites/from": ["users/nickName", "users/email"] }],
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
                from: getFrom(x, activitesData.data, hostId)
            }
        })

        let removeCreateId = allData.filter((x) => { return x.action !== "created id" })
        let findEventEnding = _.findIndex(removeCreateId, (x) => { return x.action === "event ending" })

        if (findEventEnding === -1) {

            res.status(200);
            res.send(removeCreateId);

        } else {
            let finalAnswer = removeCreateId[findEventEnding];
            let removefinalAnsewr = removeCreateId.filter((x) => { return x.action !== "event ending" });
            removefinalAnsewr.push(finalAnswer);

            res.status(200);
            res.send(removefinalAnsewr);
        }


    }
}

function getFrom(data, activitesData, hostId) {
    if (Number(data.action) === data.action) {
        let findActivites = _.find(activitesData, (x) => { return x._id === data.action })
        return findActivites['activites/from']['users/nickName'].length != 0 ? findActivites['activites/from']['users/nickName'] : findActivites['activites/from']['users/email'];
    } else if (data.action.search("final answer") !== -1) {
        return "system"
    } else {
        let findNameHost = _.find(activitesData, (x) => { return x._id === hostId })
        return findNameHost['users/nickName'] ? findNameHost['users/nickName'] : findNameHost['users/email'];
    }
}

function getFinalAction(data, activitesData) {
    if (Number(data.action) === data.action) {
        let findActivites = _.find(activitesData, (x) => { return x._id === data.action })
        return findActivites['activites/role']
    } else if (data.action.search("final answer") !== -1) {
        if(data.action.search("Undefined") === -1){
            return "event ending";
        }else{
            return "reverted";
        }
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
            return checkActivites(data);
    }
}

function checkActivites(data) {
    if (data.asserted[0]["events/finalAnswerNumber"] !== undefined) {
        return "final answer is " + data.asserted[0]["events/finalAnswerNumber"]
    }else if(data.asserted[0]["events/reverted"] === true){
        return "final answer is Undefined. Because event is reverted";
    } else if (data.asserted[0]['events/parcipiantsAnswer'] !== undefined) {
        return data.asserted[0]['events/parcipiantsAnswer'][0]["_id"]
    } else if (data.asserted[0]['events/validatorsAnswer'] !== undefined) {
        return data.asserted[0]['events/validatorsAnswer'][0]["_id"]
    }
}


module.exports = {
    historyQuizeById
}