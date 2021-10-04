import axios from 'axios';

import { path } from "../../config/path";


const validEventBot = async (req: any, res: any) => {
    const eventId = req.body.id;
    const answes = req.body.answer;

    const eventParams = {
        "select": ['answers', 'endTime', 'answers', 'status', 'endTime'],
        "from": eventId,
    }
    const botParams = {
        "select": ["users/wallet", "users/seedPhrase"],
        "where": "users/isBot = true"
    }

    let event = await axios.post(`${path}/query`, eventParams).catch((err) => {
        res.status(400);
        res.send(err.return.data.message);
        return;
    })
    let bots = await axios.post(`${path}/query`, botParams).catch((err) => {
        res.status(400);
        res.send(err.return.data.message);
        return;
    })

    // if (event && event.data.length){
    //     await checkEventTime(event.endTime)
    //     res.status(400)
    //     res.send({ message: "Event time is over" })
    // }

    

    console.log(event);
    
}

const checkEventTime = async (endTime: number) => {
    const nowTime = Math.floor(Date.now() / 1000);
    if (endTime < nowTime) {
        return 0
    }
}




export {
    validEventBot
}

