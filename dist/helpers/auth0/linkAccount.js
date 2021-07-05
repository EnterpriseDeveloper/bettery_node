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
var key_1 = __importDefault(require("../../config/key"));
var path_1 = __importDefault(require("../../config/path"));
var betteryToken_1 = __importDefault(require("../../services/funds/betteryToken"));
var init = function (res) { return __awaiter(void 0, void 0, void 0, function () {
    var data;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0: return [4 /*yield*/, axios_1.default.post(key_1.default.auth0Path + "/oauth/token", {
                    "client_id": key_1.default.auth0ClientId,
                    "client_secret": key_1.default.auth0Secret,
                    "audience": key_1.default.auth0Path + "/api/v2/",
                    "grant_type": "client_credentials"
                }, {
                    headers: {
                        'Content-Type': 'application/json',
                    }
                }).catch(function (err) {
                    console.log("error get auth0 token", err);
                    res.status(400);
                    res.send({ status: err });
                    return;
                })];
            case 1:
                data = _a.sent();
                return [2 /*return*/, data.data.access_token];
        }
    });
}); };
var linkAccount = function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var accessKey, firstId, secondId, secondUserId, verifier, provider, x, linked, z, wallet;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0: return [4 /*yield*/, init(res)];
            case 1:
                accessKey = _a.sent();
                firstId = req.body.dataFromRedis.key[0].verifierId;
                secondId = req.body.verifierId;
                secondUserId = secondId.substring(secondId.lastIndexOf('|') + 1);
                verifier = getVerifier(secondId);
                provider = getProvider(secondId);
                return [4 /*yield*/, axios_1.default.post(key_1.default.auth0Path + "/api/v2/users/" + firstId + "/identities", {
                        "provider": provider,
                        "user_id": provider == "oauth2" ? verifier + "|" + secondUserId : secondUserId
                    }, {
                        headers: {
                            'Authorization': "Bearer " + accessKey,
                            'Content-Type': 'application/json'
                        }
                    }).catch(function (err) {
                        console.log("from link auth0 ", err);
                        res.status(400);
                        res.send({ status: err });
                        return;
                    })];
            case 2:
                x = _a.sent();
                if (!x) return [3 /*break*/, 5];
                linked = [{
                        "_id": req.body.dataFromRedis.id,
                        "linkedAccounts": [verifier]
                    }];
                return [4 /*yield*/, axios_1.default.post(path_1.default.path + "/transact", linked).catch(function (err) {
                        console.log("from link auth0 DB ", err);
                        res.status(400);
                        res.send({ status: err });
                        return;
                    })];
            case 3:
                z = _a.sent();
                if (!z) return [3 /*break*/, 5];
                wallet = req.body.dataFromRedis.wallet;
                return [4 /*yield*/, betteryToken_1.default.mintTokens(wallet, 10)];
            case 4:
                _a.sent();
                res.status(200);
                res.send({ status: "done" });
                _a.label = 5;
            case 5: return [2 /*return*/];
        }
    });
}); };
var getProvider = function (x) {
    if (x.search("google-oauth2") != -1) {
        return "google-oauth2";
    }
    else if (x.search("oauth2") != -1) {
        return "oauth2";
    }
    else {
        return x.split('|')[0];
    }
};
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
module.exports = {
    linkAccount: linkAccount
};
