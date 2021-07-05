import crypto from 'crypto-js';
import { getFromRedis, updateLastUpdate } from '../helpers/redis-helper'
import { secretRedis } from '../config/key'

export = async (req: any, res: any, next: any) => {
    try {
        const sessionToken = req.get('Authorization');
        const accessToken = req.get('Cookies')

        if (!sessionToken || !accessToken) {
            return next(res.send('no token'), 400)
        }

        const bytes = crypto.AES.decrypt(sessionToken, secretRedis);
        const decryptedData = bytes.toString(crypto.enc.Utf8);

        const fromRedis = await getFromRedis(decryptedData)

        if (!fromRedis) {
            return next(res.send('not valid token'), 400)
        }

        fromRedis.key.forEach((el: any) => {
            if (el.sessionKey === accessToken) {
                el.lastUpdated = Date.now()
            }
        })

        updateLastUpdate(decryptedData, fromRedis)

        const data = fromRedis.key.filter((el: any) => {
            return el.sessionKey === accessToken
        });
        if (!data.length) {
            return next(res.send('not valid token'))
        }
        fromRedis.key = data
        req.body.dataFromRedis = fromRedis;
        next()
    } catch (e) {
        res.send(e.message);
        next(e)
    }
}


