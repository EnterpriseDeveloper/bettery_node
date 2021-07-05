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
var PlayerPayment_json_1 = __importDefault(require("../../abi/PlayerPayment.json"));
var contractInit_1 = __importDefault(require("../../contractInit"));
var path_1 = __importDefault(require("../../../config/path"));
var axios_1 = __importDefault(require("axios"));
var nonce_1 = __importDefault(require("../../nonce/nonce"));
var getGasPrice_1 = __importDefault(require("../../gasPrice/getGasPrice"));
var limits_1 = __importDefault(require("../../../config/limits"));
var payToPlayers = function (data) { return __awaiter(void 0, void 0, void 0, function () {
    var id, expertPercMint, percent, expertPremiumPerc, params, allData, mintedTokens, premiumTokens, correctAnswer, _a, rightValidators, forSendReputation, amountLoserToken, allReputation, payToValidators, i, reputation, amountMint, payToken, premiumAmount, obj, path, contract, gasEstimate, _b, _c, err_1;
    var _d;
    return __generator(this, function (_e) {
        switch (_e.label) {
            case 0:
                console.log("from payToPlayers", data);
                id = data.id;
                expertPercMint = data.expertPercMint;
                percent = data.percent;
                expertPremiumPerc = data.expertPremiumPerc;
                params = {
                    "select": [
                        "publicEvents/mintedTokens",
                        "publicEvents/premiumTokens",
                        "publicEvents/finalAnswerNumber",
                        "publicEvents/premium",
                        {
                            "publicEvents/validatorsAnswer": [
                                "publicActivites/answer",
                                "publicActivites/expertReput",
                                {
                                    "publicActivites/from": [
                                        "users/_id",
                                        "users/expertReputPoins"
                                    ]
                                }
                            ]
                        },
                        {
                            "publicEvents/parcipiantsAnswer": [
                                "publicActivites/answer",
                                "publicActivites/amount"
                            ]
                        }
                    ],
                    "from": Number(id)
                };
                return [4 /*yield*/, axios_1.default.post(path_1.default.path + "/query", params).catch(function (err) {
                        console.log("DB error in 'payToPlayers': " + err.response.data.message);
                        return;
                    })];
            case 1:
                allData = _e.sent();
                mintedTokens = allData.data[0]['publicEvents/mintedTokens'];
                premiumTokens = allData.data[0]['publicEvents/premiumTokens'];
                correctAnswer = allData.data[0]['publicEvents/finalAnswerNumber'];
                _a = calculateReput(allData, correctAnswer), rightValidators = _a.rightValidators, forSendReputation = _a.forSendReputation;
                amountLoserToken = calculateLoserPool(allData, correctAnswer);
                allReputation = calculateAllReput(rightValidators);
                payToValidators = [];
                if (allReputation > 0) {
                    for (i = 0; i < rightValidators.length; i++) {
                        reputation = rightValidators[i]['publicActivites/expertReput'] == undefined ? 0 : rightValidators[i]['publicActivites/expertReput'];
                        amountMint = 0;
                        if (mintedTokens > 0) {
                            amountMint = expertPercMint * mintedTokens * (reputation + 1) / allReputation / 100;
                        }
                        payToken = amountLoserToken * percent * (reputation + 1) / allReputation / 100;
                        premiumAmount = 0;
                        if (allData.data[0]['publicEvents/premium']) {
                            premiumAmount = premiumTokens * expertPremiumPerc * (reputation + 1) / allReputation / 100;
                        }
                        obj = {
                            "_id": Number(rightValidators[i]._id),
                            "mintedToken": amountMint,
                            "payToken": payToken,
                            "premiumToken": premiumAmount === undefined ? 0 : premiumAmount
                        };
                        payToValidators.push(obj);
                    }
                }
                else {
                    // TODO add to db percent of expert to the Marketing Fund 
                    console.log("ALL validators have minus reputation");
                }
                return [4 /*yield*/, sendToDb(payToValidators.concat(forSendReputation))];
            case 2:
                _e.sent();
                path = process.env.NODE_ENV;
                return [4 /*yield*/, contractInit_1.default.init(path, PlayerPayment_json_1.default)];
            case 3:
                contract = _e.sent();
                _e.label = 4;
            case 4:
                _e.trys.push([4, 9, , 10]);
                return [4 /*yield*/, contract.methods.letsPayToPlayers(id).estimateGas()];
            case 5:
                gasEstimate = _e.sent();
                _c = (_b = contract.methods.letsPayToPlayers(id)).send;
                _d = {
                    gas: Number((((gasEstimate * limits_1.default.gasPercent) / 100) + gasEstimate).toFixed(0))
                };
                return [4 /*yield*/, getGasPrice_1.default.getGasPriceSafeLow()];
            case 6:
                _d.gasPrice = _e.sent();
                return [4 /*yield*/, nonce_1.default.getNonce()];
            case 7: return [4 /*yield*/, _c.apply(_b, [(_d.nonce = _e.sent(),
                        _d)])];
            case 8:
                _e.sent();
                return [3 /*break*/, 10];
            case 9:
                err_1 = _e.sent();
                console.log("err from pay to players", err_1);
                return [3 /*break*/, 10];
            case 10: return [2 /*return*/];
        }
    });
}); };
var sendToDb = function (result) { return __awaiter(void 0, void 0, void 0, function () {
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0: return [4 /*yield*/, axios_1.default.post(path_1.default.path + "/transact", result).catch(function (err) {
                    console.log("error in payToPlayers: " + err.response.statusText);
                })];
            case 1:
                _a.sent();
                console.log("payToPlayers works");
                return [2 /*return*/];
        }
    });
}); };
var calculateReput = function (allData, correctAnswer) {
    var allValidators = allData.data[0]['publicEvents/validatorsAnswer'];
    var forSendReputation = [];
    var rightValidators = [];
    for (var i = 0; i < allValidators.length; i++) {
        var rep = allValidators[i]['publicActivites/from']['users/expertReputPoins'] == undefined ? 0 : allValidators[i]['publicActivites/from']['users/expertReputPoins'];
        if (correctAnswer === allValidators[i]["publicActivites/answer"]) {
            if (rep >= 0) {
                rightValidators.push(allValidators[i]);
            }
            var x = {
                "_id": Number(allValidators[i]['publicActivites/from']._id),
                "expertReputPoins": Number(rep + 1),
            };
            forSendReputation.push(x);
        }
        else {
            var x = {
                "_id": Number(allValidators[i]['publicActivites/from']._id),
                "expertReputPoins": Number(rep - 2),
            };
            forSendReputation.push(x);
        }
    }
    return {
        forSendReputation: forSendReputation,
        rightValidators: rightValidators
    };
};
var calculateLoserPool = function (allData, correctAnswer) {
    var allPar = allData.data[0]['publicEvents/parcipiantsAnswer'];
    var sum = 0;
    for (var i = 0; i < allPar; i++) {
        if (allPar[i]['publicActivites/answer'] != correctAnswer) {
            sum = sum + Number(allPar[i]['publicActivites/amount']);
        }
    }
    return sum;
};
var calculateAllReput = function (rightValidators) {
    var total = 0;
    rightValidators.forEach(function (num) {
        var exRep = num['publicActivites/expertReput'] == undefined ? 0 : num['publicActivites/expertReput'];
        if (exRep >= 0) {
            total += exRep + 1;
        }
    });
    return Number(total);
};
module.exports = {
    payToPlayers: payToPlayers
};
