"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var key_1 = __importDefault(require("../config/key"));
var redis_1 = __importDefault(require("redis"));
var redisUrl = "redis://127.0.0.1:6379";
var client = redis_1.default.createClient(redisUrl);
client.on("error", function (error) {
    console.error(error);
});
var promisify = require("util").promisify;
var getAsync = promisify(client.get).bind(client);
var sendToRedis = function (key, data) {
    client.get(key, function (err, reply) {
        var fromRedisParse;
        if (reply) {
            fromRedisParse = JSON.parse(reply);
        }
        if (fromRedisParse) {
            fromRedisParse.key.push(data.key[0]);
            var dataToString = JSON.stringify(fromRedisParse);
            client.set(key, dataToString);
        }
        else {
            var dataToString = JSON.stringify(data);
            client.set(key, dataToString);
        }
    });
};
var updateLastUpdate = function (key, data) {
    var result = JSON.stringify(data);
    client.set(key, result);
};
var getFromRedis = function (key) { return __awaiter(void 0, void 0, void 0, function () {
    var value, e_1;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                _a.trys.push([0, 2, , 3]);
                return [4 /*yield*/, getAsync(key)];
            case 1:
                value = _a.sent();
                return [2 /*return*/, JSON.parse(value)];
            case 2:
                e_1 = _a.sent();
                console.log("promisify error:");
                console.log(e_1);
                return [3 /*break*/, 3];
            case 3: return [2 /*return*/];
        }
    });
}); };
var deleteFromRedis = function (key, sessionKey) { return __awaiter(void 0, void 0, void 0, function () {
    return __generator(this, function (_a) {
        client.get(key, function (err, reply) {
            var fromRedisParse;
            if (reply) {
                fromRedisParse = JSON.parse(reply);
                fromRedisParse.key = fromRedisParse.key.filter(function (el) {
                    return el.sessionKey !== sessionKey;
                });
                if (!fromRedisParse.key.length) {
                    client.del(key);
                    client.lrem(key_1.default.secretRedisForAllKey, 0, key, function (err) {
                        if (err)
                            throw err;
                    });
                }
                else {
                    var dataToString = JSON.stringify(fromRedisParse);
                    client.set(key, dataToString);
                }
            }
        });
        return [2 /*return*/];
    });
}); };
var redisDataStructure = function (userStruct, req) {
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
    };
};
var saveKeyRedisDB = function (data) {
    try {
        client.lrange(key_1.default.secretRedisForAllKey, 0, -1, function (error, allItems) {
            if (error) {
                throw error;
            }
            if (allItems.indexOf(data) === -1) {
                var multi = client.multi();
                multi.rpush(key_1.default.secretRedisForAllKey, data);
                multi.exec(function (err) {
                    if (err)
                        throw err;
                });
            }
        });
    }
    catch (e) {
        console.log(e, 'error redis send');
    }
};
var botRedisCleaner = function () { return __awaiter(void 0, void 0, void 0, function () {
    return __generator(this, function (_a) {
        try {
            client.lrange(key_1.default.secretRedisForAllKey, 0, -1, function (error, allItems) { return __awaiter(void 0, void 0, void 0, function () {
                var _loop_1, i;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0:
                            if (error) {
                                throw error;
                            }
                            _loop_1 = function (i) {
                                var element, userDetectKey, userDetect, now_1, day30_1, clearingData, dataToString;
                                return __generator(this, function (_b) {
                                    switch (_b.label) {
                                        case 0:
                                            element = allItems[i];
                                            userDetectKey = void 0;
                                            return [4 /*yield*/, getFromRedis(element)];
                                        case 1:
                                            userDetect = _b.sent();
                                            if (userDetect) {
                                                userDetectKey = userDetect.key;
                                                now_1 = Date.now();
                                                day30_1 = 2592000000;
                                                clearingData = userDetectKey.filter(function (el) {
                                                    return (now_1 - el.lastUpdated) < day30_1;
                                                });
                                                if (!clearingData.length) {
                                                    client.del(element);
                                                    client.lrem(key_1.default.secretRedisForAllKey, 0, element, function (err) {
                                                        if (err)
                                                            throw err;
                                                    });
                                                }
                                                else {
                                                    userDetect.key = clearingData;
                                                    dataToString = JSON.stringify(userDetect);
                                                    client.set(element, dataToString);
                                                }
                                            }
                                            return [2 /*return*/];
                                    }
                                });
                            };
                            i = 0;
                            _a.label = 1;
                        case 1:
                            if (!(i < allItems.length)) return [3 /*break*/, 4];
                            return [5 /*yield**/, _loop_1(i)];
                        case 2:
                            _a.sent();
                            _a.label = 3;
                        case 3:
                            i++;
                            return [3 /*break*/, 1];
                        case 4: return [2 /*return*/];
                    }
                });
            }); });
        }
        catch (e) {
            console.log(e, 'error redis send');
        }
        return [2 /*return*/];
    });
}); };
exports.default = {
    sendToRedis: sendToRedis,
    updateLastUpdate: updateLastUpdate,
    getFromRedis: getFromRedis,
    deleteFromRedis: deleteFromRedis,
    redisDataStructure: redisDataStructure,
    saveKeyRedisDB: saveKeyRedisDB
};
