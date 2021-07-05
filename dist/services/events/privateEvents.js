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
var createRoom_1 = __importDefault(require("../rooms/createRoom"));
var event_struct_1 = __importDefault(require("../../structure/event.struct"));
var contractInit_1 = __importDefault(require("../../contract-services/contractInit"));
var PrivateEvents_json_1 = __importDefault(require("../../contract-services/abi/PrivateEvents.json"));
var nonce_1 = __importDefault(require("../../contract-services/nonce/nonce"));
var helpers_1 = __importDefault(require("../../helpers/helpers"));
var getRoom_1 = __importDefault(require("../rooms/getRoom"));
var getGasPrice_1 = __importDefault(require("../../contract-services/gasPrice/getGasPrice"));
var limits_1 = __importDefault(require("../../config/limits"));
var createPrivateEvent = function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var allData, wallet, id, type, url, _a, data, room, room, hostData, eventData, eventId, startTime, endTime, questionQuantity, pathContr, contract, gasEstimate, transaction, _b, _c, transactionHash, transactionData, err_1;
    var _d;
    return __generator(this, function (_e) {
        switch (_e.label) {
            case 0:
                allData = req.body;
                allData.host = allData.dataFromRedis.id;
                wallet = allData.dataFromRedis.wallet;
                delete allData.dataFromRedis;
                id = "privateEvents$newEvents";
                allData.status = "deployed";
                allData._id = id;
                allData.finalAnswer = '';
                allData.dateCreation = Math.floor(Date.now() / 1000);
                if (!(req.body.thumImage !== "undefined")) return [3 /*break*/, 2];
                return [4 /*yield*/, helpers_1.default.uploadImage(req.body.thumImage, id)];
            case 1:
                type = _e.sent();
                url = process.env.NODE_ENV == "production" ? "https://api.bettery.io" : "https://apitest.bettery.io";
                allData.thumImage = url + "/image/" + id + "." + type;
                allData.thumColor = undefined;
                return [3 /*break*/, 6];
            case 2:
                if (!(req.body.thumColor !== "undefined")) return [3 /*break*/, 3];
                allData.thumImage = undefined;
                return [3 /*break*/, 6];
            case 3:
                if (!(req.body.thumColor === "undefined" && req.body.thumImage === "undefined")) return [3 /*break*/, 6];
                allData.thumImage = undefined;
                if (!(req.body.whichRoom == "new")) return [3 /*break*/, 4];
                allData.thumColor = req.body.roomColor;
                return [3 /*break*/, 6];
            case 4:
                _a = allData;
                return [4 /*yield*/, getRoom_1.default.getRoomColor(allData.roomId)];
            case 5:
                _a.thumColor = _e.sent();
                _e.label = 6;
            case 6:
                delete allData.prodDev;
                if (req.body.whichRoom == "new") {
                    room = createRoom_1.default.createRoom(allData, "privateEventsId");
                    allData.room = [room._id];
                    delete allData.roomName;
                    delete allData.roomColor;
                    delete allData.whichRoom;
                    delete allData.roomId;
                    data = [
                        room,
                        allData
                    ];
                }
                else {
                    room = {
                        _id: Number(allData.roomId),
                        privateEventsId: [Number(allData._id)]
                    };
                    allData.room = [Number(allData.roomId)];
                    delete allData.roomName;
                    delete allData.roomColor;
                    delete allData.whichRoom;
                    delete allData.roomId;
                    data = [
                        room,
                        allData
                    ];
                }
                hostData = {
                    _id: allData.host,
                    hostPrivateEvents: [id],
                };
                data.push(hostData);
                return [4 /*yield*/, axios_1.default.post(path_1.default.path + "/transact", data)
                        .catch(function (err) {
                        console.log("DB error: " + err.response.data.message);
                        res.status(400);
                        res.send(err.response.data.message);
                    })];
            case 7:
                eventData = _e.sent();
                eventId = eventData.data.tempids['privateEvents$newEvents'];
                startTime = req.body.startTime;
                endTime = req.body.endTime;
                questionQuantity = req.body.answers.length;
                _e.label = 8;
            case 8:
                _e.trys.push([8, 16, , 17]);
                pathContr = process.env.NODE_ENV;
                return [4 /*yield*/, contractInit_1.default.init(pathContr, PrivateEvents_json_1.default)];
            case 9:
                contract = _e.sent();
                return [4 /*yield*/, contract.methods.createEvent(eventId, startTime, endTime, questionQuantity, wallet).estimateGas()];
            case 10:
                gasEstimate = _e.sent();
                _c = (_b = contract.methods.createEvent(eventId, startTime, endTime, questionQuantity, wallet)).send;
                _d = {
                    gas: Number((((gasEstimate * limits_1.default.gasPercent) / 100) + gasEstimate).toFixed(0))
                };
                return [4 /*yield*/, getGasPrice_1.default.getGasPrice()];
            case 11:
                _d.gasPrice = _e.sent();
                return [4 /*yield*/, nonce_1.default.getNonce()];
            case 12: return [4 /*yield*/, _c.apply(_b, [(_d.nonce = _e.sent(),
                        _d)])];
            case 13:
                transaction = _e.sent();
                if (!transaction) return [3 /*break*/, 15];
                transactionHash = transaction.transactionHash;
                transactionData = [{
                        _id: eventId,
                        transactionHash: transactionHash,
                    }];
                return [4 /*yield*/, axios_1.default.post(path_1.default.path + "/transact", transactionData).catch(function (err) {
                        console.log("DB error: " + err.response.data.message);
                        res.status(400);
                        res.send(err.response.data.message);
                    })];
            case 14:
                _e.sent();
                res.status(200).send({ id: eventId });
                _e.label = 15;
            case 15: return [3 /*break*/, 17];
            case 16:
                err_1 = _e.sent();
                console.log(err_1.message);
                res.status(400);
                res.send(err_1.message);
                return [3 /*break*/, 17];
            case 17: return [2 /*return*/];
        }
    });
}); };
var participate = function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var eventId, answer, from, wallet, pathContr, contract, gasEstimate, transaction, _a, _b, data, err_2;
    var _c;
    return __generator(this, function (_d) {
        switch (_d.label) {
            case 0:
                eventId = Number(req.body.eventId);
                answer = Number(req.body.answer);
                from = req.body.dataFromRedis.id;
                if (!(eventId == undefined || answer == undefined || from == undefined)) return [3 /*break*/, 1];
                res.status(400);
                res.send({ "error": "structure is incorrect" });
                return [3 /*break*/, 10];
            case 1:
                _d.trys.push([1, 9, , 10]);
                wallet = req.body.dataFromRedis.wallet;
                pathContr = process.env.NODE_ENV;
                return [4 /*yield*/, contractInit_1.default.init(pathContr, PrivateEvents_json_1.default)];
            case 2:
                contract = _d.sent();
                return [4 /*yield*/, contract.methods.setAnswer(eventId, answer, wallet).estimateGas()];
            case 3:
                gasEstimate = _d.sent();
                _b = (_a = contract.methods.setAnswer(eventId, answer, wallet)).send;
                _c = {
                    gas: Number((((gasEstimate * limits_1.default.gasPercent) / 100) + gasEstimate).toFixed(0))
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
                data = [{
                        _id: 'privateActivites$newEvents',
                        eventId: eventId,
                        date: Math.floor(Date.now() / 1000),
                        answer: answer,
                        transactionHash: transaction.transactionHash,
                        from: from,
                        role: "participate"
                    }];
                // add to user table
                data.push({
                    _id: from,
                    privateActivites: ["privateActivites$newEvents"],
                });
                // add to event
                data.push({
                    _id: eventId,
                    parcipiantsAnswer: ["privateActivites$newEvents"],
                });
                return [4 /*yield*/, axios_1.default.post(path_1.default.path + "/transact", data).catch(function (err) {
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
                err_2 = _d.sent();
                console.log(err_2.message);
                res.status(400);
                res.send(err_2.message);
                return [3 /*break*/, 10];
            case 10: return [2 /*return*/];
        }
    });
}); };
var validate = function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var eventId, answer, answerNumber, from, wallet, pathContr, contract, gasEstimate, transaction, _a, _b, data, err_3;
    var _c;
    return __generator(this, function (_d) {
        switch (_d.label) {
            case 0:
                eventId = Number(req.body.eventId);
                answer = req.body.answer;
                answerNumber = Number(req.body.answerNumber);
                from = Number(req.body.dataFromRedis.id);
                if (!(eventId == undefined || answer == undefined || from == undefined || answerNumber == undefined)) return [3 /*break*/, 1];
                res.status(400);
                res.send({ "error": "structure is incorrect" });
                return [3 /*break*/, 8];
            case 1:
                _d.trys.push([1, 7, , 8]);
                wallet = req.body.dataFromRedis.wallet;
                pathContr = process.env.NODE_ENV;
                return [4 /*yield*/, contractInit_1.default.init(pathContr, PrivateEvents_json_1.default)];
            case 2:
                contract = _d.sent();
                return [4 /*yield*/, contract.methods.setCorrectAnswer(eventId, answerNumber, wallet).estimateGas()];
            case 3:
                gasEstimate = _d.sent();
                _b = (_a = contract.methods.setCorrectAnswer(eventId, answerNumber, wallet)).send;
                _c = {
                    gas: Number((((gasEstimate * limits_1.default.gasPercent) / 100) + gasEstimate).toFixed(0))
                };
                return [4 /*yield*/, getGasPrice_1.default.getGasPrice()];
            case 4:
                _c.gasPrice = _d.sent();
                return [4 /*yield*/, nonce_1.default.getNonce()];
            case 5: return [4 /*yield*/, _b.apply(_a, [(_c.nonce = _d.sent(),
                        _c)])];
            case 6:
                transaction = _d.sent();
                if (transaction) {
                    data = [{
                            _id: 'privateActivites$newEvents',
                            eventId: eventId,
                            date: Math.floor(Date.now() / 1000),
                            answer: answerNumber,
                            transactionHash: transaction.transactionHash,
                            from: from,
                            role: "validate"
                        }];
                    // add to user table
                    data.push({
                        _id: from,
                        privateActivites: ["privateActivites$newEvents"],
                    });
                    // add to event
                    data.push({
                        _id: eventId,
                        validatorAnswer: "privateActivites$newEvents",
                        finalAnswerNumber: answerNumber,
                        finalAnswer: answer
                    });
                    axios_1.default.post(path_1.default.path + "/transact", data).then(function () {
                        res.status(200);
                        res.send({ done: "ok" });
                    }).catch(function (err) {
                        res.status(400);
                        res.send(err.response.data.message);
                        console.log("DB error: " + err.response.data.message);
                    });
                }
                return [3 /*break*/, 8];
            case 7:
                err_3 = _d.sent();
                console.log(err_3.message);
                res.status(400);
                res.send(err_3.message);
                return [3 /*break*/, 8];
            case 8: return [2 /*return*/];
        }
    });
}); };
var getById = function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var id, conf, event_1, obj;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                id = Number(req.body.id);
                if (!!id) return [3 /*break*/, 1];
                res.status(400);
                res.send({ "error": "do not have id" });
                return [3 /*break*/, 3];
            case 1:
                conf = {
                    "select": ["*",
                        { 'privateEvents/parcipiantsAnswer': ["*", { "privateActivites/from": ["*"] }] },
                        { 'privateEvents/validatorAnswer': ["*", { "privateActivites/from": ["*"] }] },
                        { 'privateEvents/host': ["*"] },
                        { 'privateEvents/room': ["*"] }
                    ],
                    "from": id
                };
                return [4 /*yield*/, axios_1.default.post(path_1.default.path + "/query", conf).catch(function (err) {
                        res.status(400);
                        res.send(err.response.data);
                        console.log("DB error: " + err.response.data);
                    })];
            case 2:
                event_1 = _a.sent();
                if (event_1) {
                    if (event_1.data.length != 0) {
                        obj = event_struct_1.default.privateEventStructure([event_1.data[0]]);
                        res.status(200);
                        res.send(obj[0]);
                    }
                    else {
                        res.status(404);
                        res.send({ "error": "event not found" });
                    }
                }
                _a.label = 3;
            case 3: return [2 /*return*/];
        }
    });
}); };
module.exports = {
    createPrivateEvent: createPrivateEvent,
    getById: getById,
    participate: participate,
    validate: validate
};
