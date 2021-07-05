"use strict";
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
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
var PlayerPayment_json_1 = __importDefault(require("../abi/PlayerPayment.json"));
var contractInit_1 = __importDefault(require("../contractInit"));
var axios_1 = __importDefault(require("axios"));
var path_1 = __importDefault(require("../../config/path"));
var web3_1 = __importDefault(require("web3"));
var nonce_1 = __importDefault(require("../nonce/nonce"));
var getGasPrice_1 = __importDefault(require("../gasPrice/getGasPrice"));
var limits_1 = __importDefault(require("../../config/limits"));
var payToRefferers = function (data) { return __awaiter(void 0, void 0, void 0, function () {
    var id, path, contract, getPlayers, mintedTokens, players, ref, refAmount, contrPercet, allData, fakeAddr, _a, payRefAddr, payRefAmount, payComp, gasEstimate, _b, _c, err_1;
    var _d;
    return __generator(this, function (_e) {
        switch (_e.label) {
            case 0:
                console.log("from payToRefferers");
                console.log(data);
                id = data.id;
                path = process.env.NODE_ENV;
                return [4 /*yield*/, contractInit_1.default.init(path, PlayerPayment_json_1.default)];
            case 1:
                contract = _e.sent();
                return [4 /*yield*/, fetchDataFromDb(id)];
            case 2:
                getPlayers = _e.sent();
                mintedTokens = Number(getPlayers.data[0]["mintedTokens"]);
                players = getPlayers.data[0]["publicEvents/parcipiantsAnswer"];
                ref = letFindAllRef(players);
                refAmount = getRefAmount(ref);
                return [4 /*yield*/, getPercentFromContract(contract)];
            case 3:
                contrPercet = _e.sent();
                allData = calcTokens(ref, refAmount, mintedTokens, contrPercet);
                return [4 /*yield*/, contract.methods.fakeAddr().call()];
            case 4:
                fakeAddr = _e.sent();
                _a = getRefStruct(allData, fakeAddr, refAmount, mintedTokens, contrPercet), payRefAddr = _a.payRefAddr, payRefAmount = _a.payRefAmount, payComp = _a.payComp;
                _e.label = 5;
            case 5:
                _e.trys.push([5, 10, , 11]);
                return [4 /*yield*/, contract.methods.payToReff(id, payRefAddr[0], payRefAmount[0], payRefAddr[1], payRefAmount[1], payRefAddr[2], payRefAmount[2], payComp).estimateGas()];
            case 6:
                gasEstimate = _e.sent();
                _c = (_b = contract.methods.payToReff(id, payRefAddr[0], payRefAmount[0], payRefAddr[1], payRefAmount[1], payRefAddr[2], payRefAmount[2], payComp)).send;
                _d = {
                    gas: Number((((gasEstimate * limits_1.default.gasPercent) / 100) + gasEstimate).toFixed(0))
                };
                return [4 /*yield*/, getGasPrice_1.default.getGasPriceSafeLow()];
            case 7:
                _d.gasPrice = _e.sent();
                return [4 /*yield*/, nonce_1.default.getNonce()];
            case 8: return [4 /*yield*/, _c.apply(_b, [(_d.nonce = _e.sent(),
                        _d)])];
            case 9:
                _e.sent();
                return [3 /*break*/, 11];
            case 10:
                err_1 = _e.sent();
                console.log("err from pay to pay to refferers", err_1);
                return [3 /*break*/, 11];
            case 11: return [2 /*return*/];
        }
    });
}); };
var fetchDataFromDb = function (id) { return __awaiter(void 0, void 0, void 0, function () {
    var fetchData;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                fetchData = {
                    "select": [
                        "mintedTokens",
                        {
                            "publicEvents/parcipiantsAnswer": [
                                {
                                    "publicActivites/from": [
                                        {
                                            "users/invitedBy": [
                                                "users/wallet",
                                                {
                                                    "users/invitedBy": [
                                                        "users/wallet",
                                                        { "users/invitedBy": ["_id", "users/wallet"] }
                                                    ]
                                                }
                                            ]
                                        }
                                    ]
                                }
                            ]
                        }
                    ],
                    "from": Number(id)
                };
                return [4 /*yield*/, axios_1.default.post(path_1.default.path + "/query", fetchData).catch(function (err) {
                        console.log("DB error from query payToRefferers: " + err.response.data.message);
                        return;
                    })];
            case 1: return [2 /*return*/, _a.sent()];
        }
    });
}); };
var letFindAllRef = function (players) {
    var allData = [];
    var _loop_1 = function (i) {
        // find L1
        if (players[i]['publicActivites/from']['users/invitedBy']) {
            var walletRef_1 = players[i]['publicActivites/from']['users/invitedBy']['users/wallet'];
            var findRef = allData.findIndex(function (x) { return x.wallet == walletRef_1 && x.level == 0; });
            if (findRef == -1) {
                allData.push({
                    wallet: walletRef_1,
                    amount: 1,
                    level: 0
                });
            }
            else {
                allData[findRef].amount++;
            }
            //  find L2
            if (players[i]['publicActivites/from']['users/invitedBy']['users/invitedBy']) {
                var walletRef_2 = players[i]['publicActivites/from']['users/invitedBy']['users/invitedBy']['users/wallet'];
                var findRef_1 = allData.findIndex(function (x) { return x.wallet == walletRef_2 && x.level == 1; });
                if (findRef_1 == -1) {
                    allData.push({
                        wallet: walletRef_2,
                        amount: 1,
                        level: 1
                    });
                }
                else {
                    allData[findRef_1].amount++;
                }
                // find L3
                if (players[i]['publicActivites/from']['users/invitedBy']['users/invitedBy']['users/invitedBy']) {
                    var walletRef_3 = players[i]['publicActivites/from']['users/invitedBy']['users/invitedBy']['users/invitedBy']['users/wallet'];
                    var findRef_2 = allData.findIndex(function (x) { return x.wallet == walletRef_3 && x.level == 2; });
                    if (findRef_2 == -1) {
                        allData.push({
                            wallet: walletRef_3,
                            amount: 1,
                            level: 2
                        });
                    }
                    else {
                        allData[findRef_2].amount++;
                    }
                }
            }
        }
    };
    for (var i = 0; i < players.length; i++) {
        _loop_1(i);
    }
    return allData;
};
var getRefAmount = function (allData) {
    var ref1 = 0, ref2 = 0, ref3 = 0, refAmount = [];
    for (var i = 0; i < allData.length; i++) {
        if (allData[i].level == 0) {
            ref1 = ref1 + allData[i].amount;
        }
        if (allData[i].level == 1) {
            ref2 = ref2 + allData[i].amount;
        }
        if (allData[i].level == 2) {
            ref3 = ref3 + allData[i].amount;
        }
    }
    refAmount[0] = ref1;
    refAmount[1] = ref2;
    refAmount[2] = ref3;
    return refAmount;
};
var calcTokens = function (allData, refAmount, mintedTokens, percent) {
    return allData.map(function (x) {
        return __assign(__assign({}, x), { tokens: (percent[x.level] * mintedTokens / 100) * x.amount / refAmount[x.level] });
    });
};
var getPercentFromContract = function (contract) { return __awaiter(void 0, void 0, void 0, function () {
    var percent, _a, _b, _c, _d, _e, _f, _g, _h, _j;
    return __generator(this, function (_k) {
        switch (_k.label) {
            case 0:
                percent = [];
                _a = percent;
                _b = 0;
                _c = Number;
                return [4 /*yield*/, contract.methods.firstRefer().call()];
            case 1:
                _a[_b] = _c.apply(void 0, [_k.sent()]);
                _d = percent;
                _e = 1;
                _f = Number;
                return [4 /*yield*/, contract.methods.secontRefer().call()];
            case 2:
                _d[_e] = _f.apply(void 0, [_k.sent()]);
                _g = percent;
                _h = 2;
                _j = Number;
                return [4 /*yield*/, contract.methods.thirdRefer().call()];
            case 3:
                _g[_h] = _j.apply(void 0, [_k.sent()]);
                return [2 /*return*/, percent];
        }
    });
}); };
var getRefStruct = function (allData, fakeAddr, refAmount, mintedTokens, contrPercet) {
    var web3 = new web3_1.default();
    var payRefAddr = [[], [], []];
    var payRefAmount = [[], [], []];
    var payComp = 0;
    if (refAmount[0] > 0) {
        for (var i = 0; i < allData.length; i++) {
            if (allData[i].level == 0) {
                payRefAddr[0].push(allData[i].wallet);
                payRefAmount[0].push(web3.utils.toWei(String(allData[i].tokens), "ether"));
            }
        }
        if (refAmount[1] > 0) {
            for (var i = 0; i < allData.length; i++) {
                if (allData[i].level == 1) {
                    payRefAddr[1].push(allData[i].wallet);
                    payRefAmount[1].push(web3.utils.toWei(String(allData[i].tokens), "ether"));
                }
            }
            if (refAmount[2] > 100) {
                for (var i = 0; i < allData.length; i++) {
                    if (allData[i].level == 2) {
                        payRefAddr[2].push(allData[i].wallet);
                        payRefAmount[2].push(web3.utils.toWei(String(allData[i].tokens), "ether"));
                    }
                }
            }
            else {
                payRefAddr[2][0] = fakeAddr;
                payRefAmount[2][0] = '0';
                payComp = web3.utils.toWei(String((contrPercet[2]) * mintedTokens / 100), "ether");
            }
        }
        else {
            payRefAddr[1][0] = fakeAddr;
            payRefAddr[2][0] = fakeAddr;
            payRefAmount[1][0] = '0';
            payRefAmount[2][0] = '0';
            payComp = web3.utils.toWei(String((contrPercet[1] + contrPercet[2]) * mintedTokens / 100), "ether");
        }
    }
    else {
        payRefAddr[0][0] = fakeAddr;
        payRefAddr[1][0] = fakeAddr;
        payRefAddr[2][0] = fakeAddr;
        payRefAmount[0][0] = '0';
        payRefAmount[1][0] = '0';
        payRefAmount[2][0] = '0';
        payComp = web3.utils.toWei(String((contrPercet[0] + contrPercet[1] + contrPercet[2]) * mintedTokens / 100), "ether");
    }
    return { payRefAddr: payRefAddr, payRefAmount: payRefAmount, payComp: payComp };
};
module.exports = {
    payToRefferers: payToRefferers
};
