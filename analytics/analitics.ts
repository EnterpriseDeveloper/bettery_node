import axios from "axios";
import { path, demonAPI } from "../config/path";
import { balanceCheck } from "../services/funds/userTokens";
import Web3 from "web3";

const usersAmount = async (req: any, res: any) => {
    let params: any = {
        select: ["_id", 'isBot'],
        from: "users"
    }

    let data: any = await axios.post(`${path}/query`, params).catch((err) => {
        res.status(400)
        res.send(`Error from DB: ${err.response.statusText}`)
        return
    })

    if (data.data.length) {
        let pureDate = data.data.filter((el: any) => {
            return el.isBot == undefined
        })
        res.status(200)
        res.send({ amount: pureDate.length })
    } else {
        res.status(400)
        res.send(`no users`)
    }
}

const analytics24h = async (req: any, res: any) => {
    let time = new Date().setHours(0, 0, 0, 0) / 1000
    let day = 86400

    let params: any = {
        "select": ["publicEvents/dateCreation", {
            "publicEvents/parcipiantsAnswer": [
                { "publicActivites/from": ["users/isBot"] }
            ]
        }, {
                "publicEvents/validatorsAnswer": [
                    { "publicActivites/from": ["users/isBot"] }
                ]
            }],
        "where": `publicEvents/dateCreation > ${time - day}`
    }

    let usersParams: any = {
        select: ["_id", "isBot", "registered"],
        from: "users"
    }

    let data: any = await axios.post(`${path}/query`, params).catch((err) => {
        res.status(400)
        res.send(`Error from DB: ${err.response.statusText}`)
        return
    })

    let usersData: any = await axios.post(`${path}/query`, usersParams).catch((err) => {
        res.status(400)
        res.send(`Error from DB: ${err.response.statusText}`)
        return
    })

    if (data.data.length && usersData.data.length) {

        let userPureDate = usersData.data.filter((el: any) => {
            return el.isBot == undefined && el.registered && el.registered > (time - day) && el.registered < time
        })

        let pureData = data.data.filter((el: any) => {
            return el['publicEvents/dateCreation'] < time
        })

        let { parc, val } = await letsFindRealUsers(pureData)

        res.status(200)
        res.send({
            eventsCreated: pureData.length,
            parcipiants: parc.length,
            validators: val.length,
            newUser: userPureDate.length
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

    return { parc, val }
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
                { "publicActivites/from": ["users/isBot"] }
            ]
        }, {
                "publicEvents/validatorsAnswer": [
                    { "publicActivites/from": ["users/isBot"] }
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
    let { parc, val } = await letsFindRealUsers(event)


    res.status(200)
    res.send({
        finished: !!event[0]['publicEvents/finishTime'],
        status: event[0]['publicEvents/status'],
        parcipiants: parc.length,
        validators: val.length
    })
}

const checkBalance = async (req: any, res: any) => {
    let email = req.body.email
    if (!email) {
        res.status(400)
        res.send('enter correct email')
        return
    }

    let params = {
        "select": ["wallet"],
        "from": ["users/email", email]
    }

    let data: any = await axios.post(`${path}/query`, params).catch((err: any) => {
        if (err) {
            return { status: `Error from DB: ${err.response.statusText}` }
        }
    })

    if (data.status != 200 || !data.data.length) {
        res.status(400)
        res.send('Error from DB: check your email for correctness')
        return
    }

    if (data && data.data.length) {
        let pureData = data.data[0]

        let { bet, bty } = await balanceCheck(pureData.wallet)
        let addData = await getMintBalance(pureData._id, res)

        res.status(200)
        res.send({ _id: pureData._id, bty, bet, addData })
    }
}

const getMintBalance = async (id: string, res: any) => {
    let params = {
        "select": [{ "users/minted": ["*"] }],
        "from": id
    }
    let balance: any = await axios.post(`${path}/query`, params).catch((err: any) => {
        res.status(400)
        res.send('Error from DB: check your email for correctness')
        return
    })

    if (balance.data[0]["users/minted"] == undefined) {
        return null
    } else {
        console.log(balance.data[0]["users/minted"]);
        return balance.data[0]["users/minted"].map((x: any) => {
            return {
                userId: x['mint/user']["_id"],
                amount: x['mint/amount'],
                purpose: x['mint/purpose'],
                date: new Date(x['mint/date'] * 1000),
                tx: x['mint/tx']
            }
        })
    }


}


export {
    analytics24h,
    analyticsByEventId,
    usersAmount,
    checkBalance,
    getMintBalance
}
