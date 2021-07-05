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
var contractInit_1 = __importDefault(require("../contractInit"));
var PublicEvents_json_1 = __importDefault(require("../abi/PublicEvents.json"));
var axios_1 = __importDefault(require("axios"));
var path_1 = __importDefault(require("../../config/path"));
var nonce_1 = __importDefault(require("../nonce/nonce"));
var limits_1 = __importDefault(require("../../config/limits"));
var getGasPrice_1 = __importDefault(require("../gasPrice/getGasPrice"));
var expertCalc = function (data) { return __awaiter(void 0, void 0, void 0, function () {
    var id, players, experts, expertsAmount, pathContr, contract, gasEstimate, _a, _b, send, err_1;
    var _c;
    return __generator(this, function (_d) {
        switch (_d.label) {
            case 0:
                id = data.id;
                players = Number(data.activePlayers);
                experts = 0;
                if (players < 11) {
                    experts = 3;
                }
                else {
                    experts = players / (Math.pow(players, 0.5) + 2 - (Math.pow(2, 0.5)));
                }
                expertsAmount = Math.round(experts);
                console.log("expertsAmount: " + expertsAmount);
                pathContr = process.env.NODE_ENV;
                return [4 /*yield*/, contractInit_1.default.init(pathContr, PublicEvents_json_1.default)];
            case 1:
                contract = _d.sent();
                _d.label = 2;
            case 2:
                _d.trys.push([2, 8, , 9]);
                return [4 /*yield*/, contract.methods.setActiveExpertsFromOracl(Number(expertsAmount), id).estimateGas()];
            case 3:
                gasEstimate = _d.sent();
                _b = (_a = contract.methods.setActiveExpertsFromOracl(Number(expertsAmount), id)).send;
                _c = {
                    gas: Number((((gasEstimate * limits_1.default.gasPercent) / 100) + gasEstimate).toFixed(0))
                };
                return [4 /*yield*/, getGasPrice_1.default.getGasPriceSafeLow()];
            case 4:
                _c.gasPrice = _d.sent();
                return [4 /*yield*/, nonce_1.default.getNonce()];
            case 5: return [4 /*yield*/, _b.apply(_a, [(_c.nonce = _d.sent(),
                        _c)])];
            case 6:
                _d.sent();
                send = [{
                        "_id": Number(id),
                        "validatorsAmount": expertsAmount
                    }];
                return [4 /*yield*/, axios_1.default.post(path_1.default.path + "/transact", send).catch(function (err) {
                        console.log("err from DB calclucation oracels: " + err.response.data.message);
                        return;
                    })];
            case 7:
                _d.sent();
                return [3 /*break*/, 9];
            case 8:
                err_1 = _d.sent();
                console.log("err from expert calclucation oracels", err_1);
                return [3 /*break*/, 9];
            case 9: return [2 /*return*/];
        }
    });
}); };
module.exports = {
    expertCalc: expertCalc
};
