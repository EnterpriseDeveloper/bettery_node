import axios from "axios";
import {path} from "../config/path";

const analytics24h = async (req: any, res: any) => {
    let time = new Date().setHours(0,0,0,0) / 1000
    let  day = 86400

    let params: any = {
        "select": ["*"],
        "where": `publicEvents/dateCreation > ${time - day} AND publicEvents/dateCreation < ${time}`
    }

    let data = axios.get(`${path}/query`, params).catch((err)=> {
        res.status(400)
        res.send(`Error from DB: ${err.response.statusText}`)
        return
    })


    res.status(200)
    res.send({done: "OK"})
}

const analyticsByEventId = async (req: any, res: any) => {
    res.status(200)
    res.send({done: "OK"})
}

export  {
    analytics24h,
    analyticsByEventId
}
