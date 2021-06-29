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
    client.get(key, function(err, reply) {
        let fromRedisParse;

        if(reply){
            fromRedisParse = JSON.parse(reply);
            fromRedisParse.key = fromRedisParse.key.filter(el => {
                return el.sessionKey !== sessionKey
            })

            if(!fromRedisParse.key.length) {
                client.del(key)
            } else {
                const dataToString = JSON.stringify(fromRedisParse)
                client.set(key, dataToString)
            }
        }
    })
}

const redisDataStructure = (userStruct, req) =>{
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


module.exports = {
    sendToRedis,
    getFromRedis,
    deleteFromRedis,
    redisDataStructure
}
