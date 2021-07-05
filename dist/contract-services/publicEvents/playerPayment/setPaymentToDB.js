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
var path_1 = __importDefault(require("../../../config/path"));
var web3_1 = __importDefault(require("web3"));
var setToDB = function (data) { return __awaiter(void 0, void 0, void 0, function () {
    var web3, id, avarageBet, calcMintedToken, winPool, avarageBetWin, premimWin, getData, getPlayers, allData, finalAnswer, allPlayers, premium, mintedToken, i, x, x;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                web3 = new web3_1.default();
                id = Number(data.id);
                avarageBet = Number(web3.utils.fromWei(String(data.avarageBet), "ether"));
                calcMintedToken = Number(web3.utils.fromWei(String(data.calcMintedToken), "ether"));
                winPool = Number(web3.utils.fromWei(String(data.winPool), "ether"));
                avarageBetWin = Number(web3.utils.fromWei(String(data.avarageBetWin), "ether"));
                premimWin = Number(web3.utils.fromWei(String(data.premimWin), "ether"));
                getData = {
                    "select": [
                        "publicEvents/finalAnswerNumber",
                        "publicEvents/premium",
                        "publicEvents/mintedTokens",
                        {
                            "publicEvents/parcipiantsAnswer": ["publicActivites/amount", "publicActivites/answer", "publicActivites/from"]
                        }
                    ], "from": Number(id)
                };
                return [4 /*yield*/, axios_1.default.post(path_1.default.path + "/query", getData).catch(function (err) {
                        console.log("DB error from query payToLosers: " + err.response.data.message);
                        return;
                    })];
            case 1:
                getPlayers = _a.sent();
                allData = [];
                finalAnswer = getPlayers.data[0]['publicEvents/finalAnswerNumber'];
                allPlayers = getPlayers.data[0]['publicEvents/parcipiantsAnswer'];
                premium = getPlayers.data[0]['publicEvents/premium'] == undefined ? false : getPlayers.data[0]['publicEvents/premium'];
                mintedToken = getPlayers.data[0]['publicEvents/mintedTokens'] == undefined ? 0 : getPlayers.data[0]['publicEvents/mintedTokens'];
                for (i = 0; i < allPlayers.length; i++) {
                    if (allPlayers[i]['publicActivites/answer'] != finalAnswer) {
                        x = {
                            "_id": allPlayers[i]["_id"],
                            mintedToken: mintedToken > 0 ? (calcMintedToken * allPlayers[i]['publicActivites/amount']) / (avarageBet * allPlayers.length) : 0,
                            payToken: 0,
                            premiumToken: 0
                        };
                        allData.push(x);
                    }
                    else {
                        x = {
                            "_id": allPlayers[i]["_id"],
                            mintedToken: mintedToken > 0 ? (calcMintedToken * allPlayers[i]['publicActivites/amount']) / (avarageBet * allPlayers.length) : 0,
                            payToken: ((winPool * allPlayers[i]['publicActivites/amount']) / avarageBetWin) + allPlayers[i]['publicActivites/amount'],
                            premiumToken: premium ? premimWin * allPlayers[i]['publicActivites/amount'] / avarageBetWin : 0
                        };
                        allData.push(x);
                    }
                }
                return [4 /*yield*/, axios_1.default.post(path_1.default.path + "/transact", allData).catch(function (err) {
                        console.log("DB error from transact payToLosers: " + err.response.data.message);
                        return;
                    })];
            case 2:
                _a.sent();
                return [2 /*return*/];
        }
    });
}); };
module.exports = {
    setToDB: setToDB
};
