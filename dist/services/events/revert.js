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
var contractInit_1 = __importDefault(require("../../contract-services/contractInit"));
var MiddlePayment_json_1 = __importDefault(require("../../contract-services/abi/MiddlePayment.json"));
var axios_1 = __importDefault(require("axios"));
var path_1 = __importDefault(require("../../config/path"));
var nonce_1 = __importDefault(require("../../contract-services/nonce/nonce"));
var getEventData = function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var id, purpose, config, data, partic;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                id = Number(req.body.id);
                purpose = req.body.purpose;
                config = {
                    "select": ["*",
                        { 'publicEvents/parcipiantsAnswer': ["*"] }
                    ],
                    "from": id
                };
                return [4 /*yield*/, axios_1.default.post(path_1.default.path + "/query", config).catch(function (err) {
                        console.log(err);
                        return;
                    })];
            case 1:
                data = _a.sent();
                console.log(data.data[0]);
                if (!(data.data.length != 0)) return [3 /*break*/, 6];
                if (!(data.data[0]['publicEvents/status'].search('finished') != -1)) return [3 /*break*/, 2];
                res.status(400);
                res.send({ "status": "already finished" });
                return [3 /*break*/, 5];
            case 2:
                if (!(data.data[0]['publicEvents/status'].search("reverted") != -1)) return [3 /*break*/, 3];
                res.status(400);
                res.send({ "status": "already reverted" });
                return [3 /*break*/, 5];
            case 3:
                partic = data.data[0]['publicEvents/parcipiantsAnswer'];
                return [4 /*yield*/, revertEvent(id, partic, purpose)];
            case 4:
                _a.sent();
                res.status(200);
                res.send({ "status": "done" });
                _a.label = 5;
            case 5: return [3 /*break*/, 7];
            case 6:
                res.status(400);
                res.send({ "status": "event not found" });
                _a.label = 7;
            case 7: return [2 /*return*/];
        }
    });
}); };
var revertEvent = function (eventId, participant, purpose) { return __awaiter(void 0, void 0, void 0, function () {
    var revert, path, betteryContract, gasEstimate, nonce, err_1;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                revert = [{
                        "_id": eventId,
                        "status": "reverted: " + purpose,
                        "eventEnd": Math.floor(new Date().getTime() / 1000.0)
                    }];
                return [4 /*yield*/, axios_1.default.post(path_1.default.path + "/transact", revert).catch(function (err) {
                        console.log(err);
                        return;
                    })];
            case 1:
                _a.sent();
                if (!(participant !== undefined)) return [3 /*break*/, 8];
                path = process.env.NODE_ENV;
                return [4 /*yield*/, contractInit_1.default.init(path, MiddlePayment_json_1.default)];
            case 2:
                betteryContract = _a.sent();
                _a.label = 3;
            case 3:
                _a.trys.push([3, 7, , 8]);
                return [4 /*yield*/, betteryContract.methods.revertedPayment(eventId, purpose).estimateGas()];
            case 4:
                gasEstimate = _a.sent();
                return [4 /*yield*/, nonce_1.default.getNonce()];
            case 5:
                nonce = _a.sent();
                return [4 /*yield*/, betteryContract.methods.revertedPayment(eventId, purpose).send({
                        gas: gasEstimate * 2,
                        gasPrice: 0,
                        nonce: nonce
                    })];
            case 6:
                _a.sent();
                return [3 /*break*/, 8];
            case 7:
                err_1 = _a.sent();
                console.log("error from refund Bot");
                console.log(err_1);
                return [3 /*break*/, 8];
            case 8: return [2 /*return*/];
        }
    });
}); };
module.exports = {
    getEventData: getEventData,
    revertEvent: revertEvent
};
