const { secretRedisForAllKey } = require("../config/key")

const redis = require("redis");
const redisUrl = "redis://127.0.0.1:6379";
const client = redis.createClient(redisUrl);

client.on("error", function (error) {
    console.error(error);
});

const {promisify} = require("util");
const getAsync = promisify(client.get).bind(client);

const sendToRedis = (key, data) => {
    client.get(key, function (err, reply) {
        let fromRedisParse;
        if (reply) {
            fromRedisParse = JSON.parse(reply);
        }

        if (fromRedisParse) {
            fromRedisParse.key.push(data.key[0])
            const dataToString = JSON.stringify(fromRedisParse)
            client.set(key, dataToString)
        } else {
            const dataToString = JSON.stringify(data)
            client.set(key, dataToString)
        }
    });
}

const updateLastUpdate = (key, data) => {
    const result = JSON.stringify(data);
    client.set(key, result)
}

const getFromRedis = async (key) => {
    try {
        let value = await getAsync(key);
        return JSON.parse(value);
    } catch (e) {
        console.log(`promisify error:`);
        console.log(e);
    }
}

const deleteFromRedis = async (key, sessionKey) => {
    client.get(key, function (err, reply) {
        let fromRedisParse;

        if (reply) {
            fromRedisParse = JSON.parse(reply);
            fromRedisParse.key = fromRedisParse.key.filter(el => {
                return el.sessionKey !== sessionKey
            })

            if (!fromRedisParse.key.length) {
                client.del(key)
                client.lrem(secretRedisForAllKey, 0, key, (err) => {
                    if (err) throw err
                })
            } else {
                const dataToString = JSON.stringify(fromRedisParse)
                client.set(key, dataToString)
            }
        }
    })
}

const redisDataStructure = (userStruct, req) => {
    return {
        email: userStruct[0].email,
        wallet: userStruct[0].wallet,
        id: userStruct[0]._id,
        key: [
            {
                lastUpdated: Date.now(),
                dateCreation: Date.now(),
                sessionKey: req.body.accessToken,
                typeOfLogin: userStruct[0].verifier,
                verifierId: req.body.verifierId,
            }
        ]
    }
}

const saveKeyRedisDB = (data) => {
    try {
        client.lrange(secretRedisForAllKey, 0, -1, (error, allItems) => {
            if (error) {
                throw error
            }
            if (allItems.indexOf(data) === -1) {
                let multi = client.multi();
                multi.rpush(secretRedisForAllKey, data)
                multi.exec(function (err) {
                    if (err) throw err;
                })
            }

        })
    } catch (e) {
        console.log(e, 'error redis send')
    }
}


const botRedisCleaner = async () => {
    try {
        client.lrange(secretRedisForAllKey, 0, -1, async (error, allItems) => {
            if (error) {
                throw error
            }
            for (let i = 0; i < allItems.length; i++) {
                const element = allItems[i];
                let userDetectKey;
                let userDetect = await getFromRedis(element)

                if (userDetect) {
                    userDetectKey = userDetect.key;
                    let now = Date.now()
                    let day30 = 2592000000;

                    let clearingData = userDetectKey.filter(el => {
                        return (now - el.lastUpdated) < day30
                    })

                    if (!clearingData.length) {
                        client.del(element)
                        client.lrem(secretRedisForAllKey, 0, element, (err) => {
                            if (err) throw err
                        })
                    } else {
                        userDetect.key = clearingData;
                        const dataToString = JSON.stringify(userDetect)
                        client.set(element, dataToString)
                    }
                }
            }
        })
    } catch (e) {
        console.log(e, 'error redis send')
    }
}


module.exports = {
    sendToRedis,
    updateLastUpdate,
    getFromRedis,
    deleteFromRedis,
    redisDataStructure,
    saveKeyRedisDB
}
