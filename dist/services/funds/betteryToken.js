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
var contractInit_1 = __importDefault(require("../../contract-services/contractInit"));
var BET_json_1 = __importDefault(require("../../contract-services/abi/BET.json"));
var nonce_1 = __importDefault(require("../../contract-services/nonce/nonce"));
var getGasPrice_1 = __importDefault(require("../../contract-services/gasPrice/getGasPrice"));
var web3_1 = __importDefault(require("web3"));
var limits_1 = __importDefault(require("../../config/limits"));
var mintTokens = function (address, amount) { return __awaiter(void 0, void 0, void 0, function () {
    var pathContr, betteryContract, web3, amo, gasEstimate, _a, _b;
    var _c;
    return __generator(this, function (_d) {
        switch (_d.label) {
            case 0:
                pathContr = process.env.NODE_ENV;
                return [4 /*yield*/, contractInit_1.default.init(pathContr, BET_json_1.default)];
            case 1:
                betteryContract = _d.sent();
                web3 = new web3_1.default();
                amo = web3.utils.toWei(String(amount), "ether");
                return [4 /*yield*/, betteryContract.methods.mint(address, amo).estimateGas()];
            case 2:
                gasEstimate = _d.sent();
                _b = (_a = betteryContract.methods.mint(address, amo)).send;
                _c = {
                    gas: Number((((gasEstimate * limits_1.default.gasPercent) / 100) + gasEstimate).toFixed(0))
                };
                return [4 /*yield*/, getGasPrice_1.default.getGasPrice()];
            case 3:
                _c.gasPrice = _d.sent();
                return [4 /*yield*/, nonce_1.default.getNonce()];
            case 4: return [4 /*yield*/, _b.apply(_a, [(_c.nonce = _d.sent(),
                        _c)])];
            case 5: return [2 /*return*/, _d.sent()];
        }
    });
}); };
var getBTYToken = function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var email, findWallet, getWallet, wallet, data;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                email = req.body.email;
                if (!email) return [3 /*break*/, 5];
                findWallet = {
                    "select": ["wallet"],
                    "from": ["users/email", email]
                };
                return [4 /*yield*/, axios_1.default.post(path_1.default.path + "/query", findWallet).catch(function (err) {
                        res.status(400);
                        res.send(err.response.data.message);
                    })];
            case 1:
                getWallet = _a.sent();
                if (!getWallet) return [3 /*break*/, 4];
                if (!(getWallet.data.length != 0)) return [3 /*break*/, 3];
                wallet = getWallet.data[0].wallet;
                return [4 /*yield*/, mintTokens(wallet, 10)];
            case 2:
                data = _a.sent();
                res.status(200);
                res.send(data);
                return [3 /*break*/, 4];
            case 3:
                res.status(400);
                res.send({ "message": "user not exist" });
                _a.label = 4;
            case 4: return [3 /*break*/, 6];
            case 5:
                res.status(400);
                res.send({ "message": "email is missed" });
                _a.label = 6;
            case 6: return [2 /*return*/];
        }
    });
}); };
var transferToken = function (oldWallet, newWallet) { return __awaiter(void 0, void 0, void 0, function () {
    var pathContr, betteryContract, amount, web3;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                pathContr = process.env.NODE_ENV;
                return [4 /*yield*/, contractInit_1.default.init(pathContr, BET_json_1.default)];
            case 1:
                betteryContract = _a.sent();
                return [4 /*yield*/, betteryContract.methods.balanceOf(oldWallet).call()];
            case 2:
                amount = _a.sent();
                if (!(amount != "0")) return [3 /*break*/, 4];
                web3 = new web3_1.default();
                amount = web3.utils.fromWei(amount, "ether");
                return [4 /*yield*/, mintTokens(newWallet, amount)];
            case 3: return [2 /*return*/, _a.sent()];
            case 4: return [2 /*return*/];
        }
    });
}); };
module.exports = {
    mintTokens: mintTokens,
    getBTYToken: getBTYToken,
    transferToken: transferToken
};
