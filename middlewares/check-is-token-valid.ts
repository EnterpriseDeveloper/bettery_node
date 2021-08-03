import axios from "axios";

const checkIsTokenValid = async (req: any, res: any, next: any) => {
    try {
        const accessToken = req.body.accessToken
        const loginPlatform = req.body.verifierId.split('|')

        if(loginPlatform[0] === 'google-oauth2'){
            await axios.get(`https://oauth2.googleapis.com/tokeninfo?access_token=${accessToken}`)
            .then((res) => console.log(res.data))
            .catch((err) => res.send(err).json('not valid token')) 

        }


        if(loginPlatform[0] === 'facebook'){
            await axios.get(`https://graph.facebook.com/app?access_token=${accessToken}`)
            .then((res) => console.log(res.data))
            .catch((err) => res.send(err).json('not valid token'))

        }
        
        
        next()
    } catch (e) {
        res.send(e.message);
        next(e)
    }
}

export {
    checkIsTokenValid
}