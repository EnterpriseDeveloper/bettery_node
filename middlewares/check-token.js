const crypto = require('crypto-js');
const {getFromRedis} = require('../helpers/redis-helper')
const {secretRedis} = require('../config/key')

module.exports = async (req, res, next) => {
    try {
        const sessionToken = req.get('Authorization');
        const accessToken = req.get('Cookies')

        if (!sessionToken || !accessToken) {
            return next(res.send('no token'), 400)
        }

        const bytes  = crypto.AES.decrypt(sessionToken, secretRedis);
        const decryptedData = bytes.toString(crypto.enc.Utf8);

        const fromRedis = await getFromRedis(decryptedData)

        if(!fromRedis) {
            return next(res.send('not valid token'), 400)
        }

        const data = fromRedis.key.filter(el => {
            return el.sessionKey === accessToken
        });
        if(!data.length) {
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


