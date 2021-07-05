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
var axios_1 = __importDefault(require("axios"));
var crypto_js_1 = __importDefault(require("crypto-js"));
var path_1 = __importDefault(require("../../config/path"));
var betteryToken_1 = __importDefault(require("../funds/betteryToken"));
var user_struct_1 = __importDefault(require("../../structure/user.struct"));
var redis_helper_1 = __importDefault(require("../../helpers/redis-helper"));
var key_1 = __importDefault(require("../../config/key"));
var torusRegist = function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var wallet, refId, email, verifierId, findEmail, user, data, findByref, x, dataFromRedis, dataToRedis, sessionToken, userStruct, data, update, dataToRedis;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                wallet = req.body.wallet;
                refId = req.body.refId;
                email = req.body.email;
                verifierId = getVerifier(req.body.verifierId);
                findEmail = {
                    "select": ["_id", "users/nickName", "users/email", "users/wallet", "users/avatar", "users/verifier", "users/linkedAccounts"],
                    "from": email ? ["users/email", email] : ["users/wallet", req.body.wallet]
                };
                return [4 /*yield*/, axios_1.default.post(path_1.default.path + "/query", findEmail)
                        .catch(function (err) {
                        res.status(400);
                        res.send(err.response.data.message);
                        return;
                    })];
            case 1:
                user = _a.sent();
                if (!(user.data.length === 0)) return [3 /*break*/, 6];
                data = [{
                        "_id": "users$newUser",
                        "nickName": req.body.nickName,
                        "email": email,
                        "wallet": wallet,
                        "avatar": req.body.avatar == "" ? 'https://api.bettery.io/image/avatar.png' : req.body.avatar,
                        "verifier": req.body.verifier,
                        "linkedAccounts": [verifierId]
                    }];
                if (!!isNaN(refId)) return [3 /*break*/, 3];
                return [4 /*yield*/, checkUserById(refId, res)];
            case 2:
                findByref = _a.sent();
                if (findByref) {
                    data[0].invitedBy = Number(refId),
                        data.push({
                            "_id": Number(refId),
                            "invited": ["users$newUser"]
                        });
                }
                _a.label = 3;
            case 3: return [4 /*yield*/, axios_1.default.post(path_1.default.path + "/transact", data).catch(function (err) {
                    res.status(400);
                    res.send(err.response.data.message);
                    return;
                })];
            case 4:
                x = _a.sent();
                return [4 /*yield*/, betteryToken_1.default.mintTokens(wallet, 10)];
            case 5:
                _a.sent();
                dataFromRedis = [{
                        email: email ? email : 'undefined',
                        wallet: req.body.wallet,
                        _id: x.data.tempids['users$newUser'],
                        typeOfLogin: req.body.verifier
                    }];
                dataToRedis = redis_helper_1.default.redisDataStructure(dataFromRedis, req);
                sessionToken = dataRedisSend(req.body.wallet, dataToRedis);
                res.status(200);
                res.send({
                    _id: x.data.tempids['users$newUser'],
                    nickName: req.body.nickName,
                    email: email,
                    wallet: req.body.wallet,
                    avatar: req.body.avatar,
                    verifier: req.body.verifier,
                    sessionToken: sessionToken,
                    accessToken: req.body.accessToken
                });
                return [3 /*break*/, 12];
            case 6:
                userStruct = user_struct_1.default.userStructure(user.data);
                if (!(userStruct[0].linkedAccounts.length != 0 &&
                    !userStruct[0].linkedAccounts.includes(verifierId))) return [3 /*break*/, 7];
                data = {
                    email: userStruct[0].email,
                    linkedAccounts: userStruct[0].linkedAccounts
                };
                res.status(302);
                res.send(data);
                return [3 /*break*/, 12];
            case 7:
                update = void 0;
                if (!(userStruct[0].wallet != wallet)) return [3 /*break*/, 9];
                return [4 /*yield*/, betteryToken_1.default.transferToken(userStruct[0].wallet, wallet)];
            case 8:
                _a.sent();
                userStruct[0].wallet = wallet;
                update = [{
                        "_id": userStruct[0]._id,
                        "wallet": wallet,
                        "linkedAccounts": [verifierId]
                    }];
                return [3 /*break*/, 10];
            case 9:
                // update link account
                update = [{
                        "_id": userStruct[0]._id,
                        "linkedAccounts": [verifierId]
                    }];
                _a.label = 10;
            case 10: return [4 /*yield*/, axios_1.default.post(path_1.default.path + "/transact", update).catch(function (err) {
                    console.log(err);
                    res.status(400);
                    res.send(err.response.data.message);
                    return;
                })];
            case 11:
                _a.sent();
                dataToRedis = redis_helper_1.default.redisDataStructure(userStruct, req);
                userStruct[0].sessionToken = dataRedisSend(userStruct[0].wallet, dataToRedis);
                userStruct[0].accessToken = req.body.accessToken;
                res.status(200);
                res.send(userStruct[0]);
                _a.label = 12;
            case 12: return [2 /*return*/];
        }
    });
}); };
var getVerifier = function (x) {
    if (x.search("google-oauth2") != -1) {
        return "google";
    }
    else if (x.search("oauth2") != -1) {
        return x.split('|')[1];
    }
    else {
        return x.split('|')[0];
    }
};
var autoLogin = function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var wallet, accessToken, detectUser, findUser, user, o;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                wallet = req.body.wallet;
                accessToken = req.body.accessToken;
                return [4 /*yield*/, redis_helper_1.default.getFromRedis(wallet)];
            case 1:
                detectUser = _a.sent();
                if (!(detectUser == null)) return [3 /*break*/, 2];
                res.status(400);
                res.send('not valid token');
                return [2 /*return*/];
            case 2:
                if (!(detectUser.key.find(function (x) { return x.sessionKey == accessToken; }) == undefined)) return [3 /*break*/, 3];
                res.status(400);
                res.send('not valid token');
                return [2 /*return*/];
            case 3:
                findUser = {
                    "select": ["_id", "users/nickName", "users/email", "users/wallet", "users/avatar", "users/verifier", "users/linkedAccounts"],
                    "from": ["users/wallet", wallet]
                };
                return [4 /*yield*/, axios_1.default.post(path_1.default.path + "/query", findUser)
                        .catch(function (err) {
                        res.status(400);
                        res.send(err.response.data.message);
                        return;
                    })];
            case 4:
                user = _a.sent();
                o = user_struct_1.default.userStructure(user.data);
                o[0].accessToken = accessToken;
                o[0].sessionToken = crypto_js_1.default.AES.encrypt(wallet, key_1.default.secretRedis).toString();
                res.status(200);
                res.send(o[0]);
                _a.label = 5;
            case 5: return [2 /*return*/];
        }
    });
}); };
var logout = function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var wallet, accessToken, e_1;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                wallet = req.body.dataFromRedis.wallet;
                accessToken = req.body.dataFromRedis.key[0].sessionKey;
                _a.label = 1;
            case 1:
                _a.trys.push([1, 3, , 4]);
                return [4 /*yield*/, redis_helper_1.default.deleteFromRedis(wallet, accessToken)];
            case 2:
                _a.sent();
                res.status(200);
                res.send({});
                return [3 /*break*/, 4];
            case 3:
                e_1 = _a.sent();
                res.status(400);
                res.send(e_1, 'error logout');
                return [3 /*break*/, 4];
            case 4: return [2 /*return*/];
        }
    });
}); };
var checkUserById = function (id, res) { return __awaiter(void 0, void 0, void 0, function () {
    var findUser, user;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                findUser = {
                    "select": ["*"],
                    "from": Number(id)
                };
                return [4 /*yield*/, axios_1.default.post(path_1.default.path + "/query", findUser)
                        .catch(function (err) {
                        res.status(400);
                        res.send(err.response.data.message);
                        return;
                    })];
            case 1:
                user = _a.sent();
                return [2 /*return*/, user.data.length === 0 ? false : true];
        }
    });
}); };
var dataRedisSend = function (wallet, dataToRedis) {
    redis_helper_1.default.sendToRedis(wallet, dataToRedis);
    redis_helper_1.default.saveKeyRedisDB(wallet);
    return crypto_js_1.default.AES.encrypt(wallet, key_1.default.secretRedis).toString();
};
module.exports = {
    torusRegist: torusRegist,
    autoLogin: autoLogin,
    logout: logout
};
