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
var web3_1 = __importDefault(require("web3"));
var networks_1 = __importDefault(require("../../config/networks"));
var axios_1 = __importDefault(require("axios"));
var path_1 = __importDefault(require("../../config/path"));
var Mutex = require('async-mutex').Mutex;
var nonceInit = function () { return __awaiter(void 0, void 0, void 0, function () {
    var _a, account, web3, nonce, getNonceConfig, getNonce, setNonce, setNonce;
    return __generator(this, function (_b) {
        switch (_b.label) {
            case 0: return [4 /*yield*/, getAccount()];
            case 1:
                _a = _b.sent(), account = _a.account, web3 = _a.web3;
                return [4 /*yield*/, web3.eth.getTransactionCount(account)];
            case 2:
                nonce = _b.sent();
                getNonceConfig = {
                    "select": ["*"],
                    "from": "configuration"
                };
                return [4 /*yield*/, axios_1.default.post(path_1.default.path + "/query", getNonceConfig).catch(function (err) {
                        console.log("get nonce err: " + err);
                    })];
            case 3:
                getNonce = _b.sent();
                if (!(getNonce.data.length != 0)) return [3 /*break*/, 5];
                setNonce = [{
                        "_id": getNonce.data[0]["_id"],
                        "nonce": nonce
                    }];
                return [4 /*yield*/, axios_1.default.post(path_1.default.path + "/transact", setNonce).catch(function (err) {
                        console.log("set nonce err: " + err);
                    })];
            case 4: return [2 /*return*/, _b.sent()];
            case 5:
                setNonce = [{
                        "_id": "configuration$newConfig",
                        "nonce": nonce
                    }];
                return [4 /*yield*/, axios_1.default.post(path_1.default.path + "/transact", setNonce).catch(function (err) {
                        console.log("set new nonce err: " + err);
                    })];
            case 6: return [2 /*return*/, _b.sent()];
        }
    });
}); };
var getNonce = function () { return __awaiter(void 0, void 0, void 0, function () {
    var mutex, release, getNonceConfig, getNonce, nonce, setNonce;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                mutex = new Mutex();
                return [4 /*yield*/, mutex.acquire()];
            case 1:
                release = _a.sent();
                getNonceConfig = {
                    "select": ["*"],
                    "from": "configuration"
                };
                return [4 /*yield*/, axios_1.default.post(path_1.default.path + "/query", getNonceConfig).catch(function (err) {
                        console.log("get nonce err: " + err);
                    })];
            case 2:
                getNonce = _a.sent();
                nonce = getNonce.data[0]['configuration/nonce'];
                setNonce = [{
                        "_id": getNonce.data[0]["_id"],
                        "nonce": nonce + 1
                    }];
                return [4 /*yield*/, axios_1.default.post(path_1.default.path + "/transact", setNonce).catch(function (err) {
                        console.log("set nonce err: " + err);
                    })];
            case 3:
                _a.sent();
                release();
                return [2 /*return*/, nonce];
        }
    });
}); };
var getAccount = function () { return __awaiter(void 0, void 0, void 0, function () {
    var provider, keys, web3, prKey, accounts, account;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                provider = process.env.NODE_ENV == "production" ? networks_1.default.maticMain : networks_1.default.maticMumbaiHttps;
                keys = process.env.NODE_ENV == "production" ? require("../keys/prod/privKey") : require("../keys/test/privKey");
                web3 = new web3_1.default(provider);
                prKey = web3.eth.accounts.privateKeyToAccount('0x' + keys.key);
                return [4 /*yield*/, web3.eth.accounts.wallet.add(prKey)];
            case 1:
                _a.sent();
                return [4 /*yield*/, web3.eth.accounts.wallet];
            case 2:
                accounts = _a.sent();
                account = accounts[0].address;
                return [2 /*return*/, { account: account, web3: web3 }];
        }
    });
}); };
module.exports = {
    nonceInit: nonceInit,
    getNonce: getNonce
};
