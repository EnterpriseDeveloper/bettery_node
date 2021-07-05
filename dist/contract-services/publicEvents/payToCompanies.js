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
var MiddlePayment_json_1 = __importDefault(require("../abi/MiddlePayment.json"));
var web3_1 = __importDefault(require("web3"));
var event_is_finish_1 = __importDefault(require("../../services/events/event_is_finish"));
var contractInit_1 = __importDefault(require("../contractInit"));
var nonce_1 = __importDefault(require("../nonce/nonce"));
var getGasPrice_1 = __importDefault(require("../gasPrice/getGasPrice"));
var limits_1 = __importDefault(require("../../config/limits"));
var payToCompanies = function (x) { return __awaiter(void 0, void 0, void 0, function () {
    var id, web3, tokens, correctAnswer, data, path, contract, gasEstimate, _a, _b, err_1;
    var _c;
    return __generator(this, function (_d) {
        switch (_d.label) {
            case 0:
                console.log("from payToCompanies");
                console.log(x);
                id = x.id;
                web3 = new web3_1.default();
                tokens = Number(web3.utils.fromWei(String(x.tokens), "ether"));
                correctAnswer = Number(x.correctAnswer);
                data = {
                    id: Number(id),
                    correctAnswer: correctAnswer,
                    tokens: tokens
                };
                return [4 /*yield*/, event_is_finish_1.default.setCorrectAnswer(data)];
            case 1:
                _d.sent();
                path = process.env.NODE_ENV;
                return [4 /*yield*/, contractInit_1.default.init(path, MiddlePayment_json_1.default)];
            case 2:
                contract = _d.sent();
                _d.label = 3;
            case 3:
                _d.trys.push([3, 8, , 9]);
                return [4 /*yield*/, contract.methods.letsPayToCompanies(id).estimateGas()];
            case 4:
                gasEstimate = _d.sent();
                _b = (_a = contract.methods.letsPayToCompanies(id)).send;
                _c = {
                    gas: Number((((gasEstimate * limits_1.default.gasPercent) / 100) + gasEstimate).toFixed(0))
                };
                return [4 /*yield*/, getGasPrice_1.default.getGasPriceSafeLow()];
            case 5:
                _c.gasPrice = _d.sent();
                return [4 /*yield*/, nonce_1.default.getNonce()];
            case 6: return [4 /*yield*/, _b.apply(_a, [(_c.nonce = _d.sent(),
                        _c)])];
            case 7:
                _d.sent();
                return [3 /*break*/, 9];
            case 8:
                err_1 = _d.sent();
                console.log("err from pay to companies", err_1);
                return [3 /*break*/, 9];
            case 9: return [2 /*return*/];
        }
    });
}); };
module.exports = {
    payToCompanies: payToCompanies
};
