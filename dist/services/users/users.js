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
var path_1 = __importDefault(require("../../config/path"));
var crypto_js_1 = __importDefault(require("crypto-js"));
var user_struct_1 = __importDefault(require("../../structure/user.struct"));
var key_1 = __importDefault(require("../../config/key"));
var reputationConvert_1 = __importDefault(require("../../helpers/reputationConvert"));
var updateNickname = function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var id, name, update;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                id = req.body.dataFromRedis.id;
                name = req.body.newNickName;
                update = [{
                        "_id": id,
                        "users/nickName": name
                    }];
                return [4 /*yield*/, axios_1.default.post(path_1.default.path + "/transact", update).catch(function (err) {
                        console.log(err);
                        res.status(400);
                        res.send(err.response.data.message);
                        return;
                    })];
            case 1:
                _a.sent();
                res.status(200);
                res.send({ name: name });
                return [2 /*return*/];
        }
    });
}); };
var updatePublicEmail = function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var id, publicEmail, update;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                id = req.body.dataFromRedis.id;
                publicEmail = req.body.publicEmail;
                update = [{
                        "_id": id,
                        "users/publicEmail": publicEmail
                    }];
                return [4 /*yield*/, axios_1.default.post(path_1.default.path + "/transact", update).catch(function (err) {
                        console.log(err);
                        res.status(400);
                        res.send(err.response.data.message);
                        return;
                    })];
            case 1:
                _a.sent();
                res.status(200);
                res.send({ publicEmail: publicEmail });
                return [2 /*return*/];
        }
    });
}); };
var getUserById = function (req, res) {
    var conf = {
        "select": ["_id", "users/nickName", "users/email", "users/wallet", "users/avatar", "users/verifier", "users/linkedAccounts"],
        "from": Number(req.body.id)
    };
    axios_1.default.post(path_1.default.path + "/query", conf).then(function (x) {
        if (x.data.length != 0) {
            var o = user_struct_1.default.userStructure([x.data[0]]);
            o[0].accessToken = req.body.dataFromRedis.key[0].sessionKey;
            o[0].sessionToken = crypto_js_1.default.AES.encrypt(req.body.dataFromRedis.wallet, key_1.default.secretRedis).toString();
            res.status(200);
            res.send(o);
        }
        else {
            res.status(400);
            res.send("user do not exist");
        }
    }).catch(function (err) {
        console.log(err);
        res.status(400);
        res.send(err);
    });
};
var allUsers = function (req, res) {
    var conf = {
        "select": ["_id", "users/nickName", "users/email", "users/wallet", "users/avatar", "users/verifier", "users/linkedAccounts"],
        "from": "users"
    };
    axios_1.default.post(path_1.default.path + "/query", conf).then(function (o) {
        var result = user_struct_1.default.userStructure(o.data);
        res.status(200);
        res.send(result);
    }).catch(function (err) {
        res.status(400);
        res.send(err.response.data.message);
    });
};
var additionalInfo = function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var conf, data, x, user;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                conf = {
                    "select": ["linkedAccounts", "publicEmail", "advisorReputPoins", "playerReputPoins", "hostReputPoins", "expertReputPoins", {
                            "invitedBy": ["_id", "users/avatar", "users/nickName"]
                        }],
                    "from": Number(req.body.id)
                };
                return [4 /*yield*/, axios_1.default.post(path_1.default.path + "/query", conf).catch(function (err) {
                        res.status(400);
                        res.send(err.response.data.message);
                        return;
                    })
                    // TODO add location, language, share data, public/private email
                ];
            case 1:
                data = _a.sent();
                x = data.data[0];
                user = {
                    linkedAccounts: x['linkedAccounts'] == undefined ? [] : x['linkedAccounts'],
                    invitedBy: x["invitedBy"] == undefined ? null : {
                        id: x["invitedBy"]["_id"],
                        nickName: x["invitedBy"]["users/nickName"],
                        avatar: x["invitedBy"]["users/avatar"]
                    },
                    publicEmail: x['publicEmail'] == undefined ? null : x['publicEmail'],
                    advisorReputPoins: x['advisorReputPoins'] == undefined ? null : x['advisorReputPoins'],
                    playerReputPoins: x['playerReputPoins'] == undefined ? null : x['playerReputPoins'],
                    hostReputPoins: x['hostReputPoins'] == undefined ? null : x['hostReputPoins'],
                    expertReputPoins: reputationConvert_1.default(x['expertReputPoins'] == undefined ? null : x['expertReputPoins'])
                };
                res.status(200);
                res.send(user);
                return [2 /*return*/];
        }
    });
}); };
module.exports = {
    allUsers: allUsers,
    getUserById: getUserById,
    additionalInfo: additionalInfo,
    updateNickname: updateNickname,
    updatePublicEmail: updatePublicEmail
};
