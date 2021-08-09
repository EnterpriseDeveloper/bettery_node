import axios from "axios";

import { auth0Path } from "../config/key"

const checkIsTokenValid = async (req: any, res: any, next: any) => {
    try {
        const accessToken = req.body.accessToken

        const checkToken: any = await axios.get(`${auth0Path}/userinfo`, {
            headers: {
                Authorization: `Bearer ${accessToken}`
            }
        })
        .then((res) => res.data)
        .catch((err) => console.log(err))

        const tokenDate = new Date(checkToken.updated_at);

        if(Date.now() - tokenDate.getTime() < 300000){
            if(checkToken.email && checkToken.email == req.body.email){              
                next()
            } else if(!checkToken.email && checkToken.sub == req.body.verifierId){
                next()
            } else {
                throw new Error(res.status(400).json('not valid token'))
            }
            
        } else {
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