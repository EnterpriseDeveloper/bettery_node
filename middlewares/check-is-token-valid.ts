import axios from "axios";
import moment from "moment";

import { auth0Path } from "../config/key"

const checkIsTokenValid = async (req: any, res: any, next: any) => {
    try {
        const accessToken = req.body.accessToken

        const checkToken = () => axios.get(`${auth0Path}/userinfo`, {
            headers: {
                Authorization: `Bearer ${accessToken}`
            }
        })
        .then((res) => res.data)
        const tokenData = await checkToken()

        if(tokenData.name == req.body.nickName || tokenData.email == req.body.email){
            const datetime = tokenData.updated_at;
            const localTime = moment();
            const otherTime = moment(datetime);

            if(localTime.diff(otherTime, 'minutes') <= 5){
                next()
            } else{
                throw new Error(res.status(400).json('not valid token'))
            }
            
        } else{
            throw new Error(res.status(400).json('not valid token'))
        }
    } catch (e) {
        res.send(e.message);
        next(e)
    }
}

export {
    checkIsTokenValid
}