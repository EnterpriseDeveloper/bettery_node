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
var PublicEvents_json_1 = __importDefault(require("../../contract-services/abi/PublicEvents.json"));
var userData_1 = __importDefault(require("../../helpers/userData"));
var web3_1 = __importDefault(require("web3"));
var nonce_1 = __importDefault(require("../../contract-services/nonce/nonce"));
var limits_1 = __importDefault(require("../../config/limits"));
var getGasPrice_1 = __importDefault(require("../../contract-services/gasPrice/getGasPrice"));
var limits_2 = __importDefault(require("../../config/limits"));
var participate = function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var web3, setAnswer, eventId, userId, amount, answerIndex, wallet, pathContr, contract, tokens, gasEstimate, transaction, _a, _b, publicActivites, event_1, user, err_1;
    var _c;
    return __generator(this, function (_d) {
        switch (_d.label) {
            case 0:
                web3 = new web3_1.default();
                setAnswer = [];
                eventId = req.body.event_id;
                userId = Number(req.body.dataFromRedis.id);
                amount = req.body.amount;
                answerIndex = req.body.answerIndex;
                if (eventId == undefined ||
                    userId == undefined ||
                    answerIndex == undefined ||
                    amount == undefined) {
                    res.status(400);
                    res.send("Structure is incorrect");
                    return [2 /*return*/];
                }
                if (Number(amount) < limits_1.default.minBetAmount) {
                    res.status(400);
                    res.send("The minimum amount for betting is 0.01 BET");
                    return [2 /*return*/];
                }
                _d.label = 1;
            case 1:
                _d.trys.push([1, 9, , 10]);
                wallet = req.body.dataFromRedis.wallet;
                pathContr = process.env.NODE_ENV;
                return [4 /*yield*/, contractInit_1.default.init(pathContr, PublicEvents_json_1.default)];
            case 2:
                contract = _d.sent();
                tokens = web3.utils.toWei(String(amount), "ether");
                return [4 /*yield*/, contract.methods.setAnswer(eventId, answerIndex, tokens, wallet).estimateGas()];
            case 3:
                gasEstimate = _d.sent();
                _b = (_a = contract.methods.setAnswer(eventId, answerIndex, tokens, wallet)).send;
                _c = {
                    gas: Number((((gasEstimate * limits_2.default.gasPercent) / 100) + gasEstimate).toFixed(0))
                };
                return [4 /*yield*/, getGasPrice_1.default.getGasPrice()];
            case 4:
                _c.gasPrice = _d.sent();
                return [4 /*yield*/, nonce_1.default.getNonce()];
            case 5: return [4 /*yield*/, _b.apply(_a, [(_c.nonce = _d.sent(),
                        _c)])];
            case 6:
                transaction = _d.sent();
                if (!transaction) return [3 /*break*/, 8];
                publicActivites = {
                    _id: "publicActivites$act",
                    from: userId,
                    answer: answerIndex,
                    role: "participant",
                    date: Math.floor(Date.now() / 1000),
                    transactionHash: transaction.transactionHash,
                    //    currencyType: currencyType,  TODO remove from DB Shema
                    eventId: eventId,
                    amount: amount
                };
                setAnswer.push(publicActivites);
                event_1 = {
                    _id: eventId,
                    "parcipiantsAnswer": ["publicActivites$act"],
                };
                setAnswer.push(event_1);
                user = {
                    _id: userId,
                    publicActivites: ["publicActivites$act"],
                };
                setAnswer.push(user);
                return [4 /*yield*/, axios_1.default.post(path_1.default.path + "/transact", setAnswer).catch(function (err) {
                        res.status(400);
                        res.send(err.response.data.message);
                        console.log("DB error: " + err.response.data.message);
                        return;
                    })];
            case 7:
                _d.sent();
                res.status(200);
                res.send({ done: "ok" });
                _d.label = 8;
            case 8: return [3 /*break*/, 10];
            case 9:
                err_1 = _d.sent();
                console.log(err_1.message);
                res.status(400);
                res.send(err_1.message);
                return [3 /*break*/, 10];
            case 10: return [2 /*return*/];
        }
    });
}); };
var validate = function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var setAnswer, eventId, from, answer, reputation, wallet, pathContr, contract, gasEstimate, transaction, _a, _b, publicActivites, event_2, user, err_2;
    var _c;
    return __generator(this, function (_d) {
        switch (_d.label) {
            case 0:
                setAnswer = [];
                eventId = Number(req.body.event_id);
                from = Number(req.body.dataFromRedis.id);
                answer = Number(req.body.answer);
                if (eventId == undefined ||
                    answer == undefined ||
                    from == undefined) {
                    res.status(400);
                    res.send("Structure is incorrect");
                    return [2 /*return*/];
                }
                _d.label = 1;
            case 1:
                _d.trys.push([1, 10, , 11]);
                return [4 /*yield*/, userData_1.default.getUserReput(from, res)];
            case 2:
                reputation = _d.sent();
                wallet = req.body.dataFromRedis.wallet;
                pathContr = process.env.NODE_ENV;
                return [4 /*yield*/, contractInit_1.default.init(pathContr, PublicEvents_json_1.default)];
            case 3:
                contract = _d.sent();
                return [4 /*yield*/, contract.methods.setValidator(eventId, answer, wallet, reputation).estimateGas()];
            case 4:
                gasEstimate = _d.sent();
                _b = (_a = contract.methods.setValidator(eventId, answer, wallet, reputation)).send;
                _c = {
                    gas: Number((((gasEstimate * limits_2.default.gasPercent) / 100) + gasEstimate).toFixed(0))
                };
                return [4 /*yield*/, getGasPrice_1.default.getGasPrice()];
            case 5:
                _c.gasPrice = _d.sent();
                return [4 /*yield*/, nonce_1.default.getNonce()];
            case 6: return [4 /*yield*/, _b.apply(_a, [(_c.nonce = _d.sent(),
                        _c)])];
            case 7:
                transaction = _d.sent();
                if (!transaction) return [3 /*break*/, 9];
                publicActivites = {
                    _id: "publicActivites$act1",
                    from: from,
                    answer: answer,
                    role: "validator",
                    date: Math.floor(Date.now() / 1000),
                    transactionHash: transaction.transactionHash,
                    // currencyType: currencyType, TODO remove from DB Shema
                    eventId: eventId,
                    amount: 0,
                    expertReput: reputation
                };
                setAnswer.push(publicActivites);
                event_2 = {
                    _id: eventId,
                    "validatorsAnswer": ["publicActivites$act1"],
                };
                setAnswer.push(event_2);
                user = {
                    _id: from,
                    publicActivites: ["publicActivites$act1"],
                };
                setAnswer.push(user);
                return [4 /*yield*/, axios_1.default.post(path_1.default.path + "/transact", setAnswer).catch(function (err) {
                        res.status(400);
                        res.send(err.response.data.message);
                        console.log("DB error: " + err.response.data.message);
                        return;
                    })];
            case 8:
                _d.sent();
                res.status(200);
                res.send({ done: "ok" });
                _d.label = 9;
            case 9: return [3 /*break*/, 11];
            case 10:
                err_2 = _d.sent();
                console.log(err_2.message);
                res.status(400);
                res.send(err_2.message);
                return [3 /*break*/, 11];
            case 11: return [2 /*return*/];
        }
    });
}); };
module.exports = {
    participate: participate,
    validate: validate
};
