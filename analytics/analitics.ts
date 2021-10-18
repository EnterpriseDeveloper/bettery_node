import axios from "axios";
import {path} from "../config/path";

const analytics24h = async (req: any, res: any) => {
    let time = new Date().setHours(0, 0, 0, 0) / 1000
    let day = 86400

    let params: any = {
        "select": ["publicEvents/dateCreation", {
            "publicEvents/parcipiantsAnswer": [
                {"publicActivites/from": ["users/isBot"]}
            ]
        }, {
            "publicEvents/validatorsAnswer": [
                {"publicActivites/from": ["users/isBot"]}
            ]
        }],
        "where": `publicEvents/dateCreation > ${time - day}`
    }

    let data: any = await axios.post(`${path}/query`, params).catch((err) => {
        res.status(400)
        res.send(`Error from DB: ${err.response.statusText}`)
        return
    })

    if (data.data.length) {
        let pureData = data.data.filter((el: any) => {
            return el['publicEvents/dateCreation'] < time
        })

        let {parc, val} = await letsFindRealUsers(pureData)

        res.status(200)
        res.send({
            eventAmount: pureData.length,
            parcipiants: parc.length,
            validators: val.length
        })
    } else {
        res.status(200)
        res.send({
            status: 'No activities'
        })
    }
}

let letsFindRealUsers = async (pureData: any) => {
    let parc: any = []
    let val: any = []

    for (let i = 0; i < pureData.length; i++) {
        if (pureData[i]['publicEvents/parcipiantsAnswer'] != undefined) {
            pureData[i]['publicEvents/parcipiantsAnswer'].map((el: any) => {

                if (!el['publicActivites/from']['users/isBot']) {
                    parc.push(el['publicActivites/from']._id)
                }
            })
        }
        if (pureData[i]['publicEvents/validatorsAnswer'] != undefined) {
            pureData[i]['publicEvents/validatorsAnswer'].map((el: any) => {

                if (!el['publicActivites/from']['users/isBot']) {
                    val.push(el['publicActivites/from']._id)
                }
            })
        }
    }
    parc = unique(parc)
    val = unique(val)

    return {parc, val}
}

let unique = (arr: any) => {
    let result: any = [];

    for (let str of arr) {
        if (!result.includes(str)) {
            result.push(str);
        }
    }
    return result;
}

const analyticsByEventId = async (req: any, res: any) => {
    let eventId = req.body.id

    let params = {
        "select": ["publicEvents/status", {
            "publicEvents/parcipiantsAnswer": [
                {"publicActivites/from": ["users/isBot"]}
            ]
        }, {
            "publicEvents/validatorsAnswer": [
                {"publicActivites/from": ["users/isBot"]}
            ]
        }],
        "from": eventId
    }

    let data: any = await axios.post(`${path}/query`, params).catch((err: any) => {
        res.status(400)
        res.send(`Error from DB: ${err.response.statusText}`)
        return
    })

    let event = data.data
    let {parc, val} = await letsFindRealUsers(event)


    res.status(200)
    res.send({
        finished: !!event[0]['publicEvents/finishTime'],
        status: event[0]['publicEvents/status'],
        parcipiants: parc.length,
        validators: val.length
    })
}




export {
    analytics24h,
    analyticsByEventId
}
