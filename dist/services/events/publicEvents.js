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
var getRoom_1 = __importDefault(require("../rooms/getRoom"));
var event_struct_1 = __importDefault(require("../../structure/event.struct"));
var filter_1 = __importDefault(require("../../helpers/filter"));
var sorting_1 = __importDefault(require("../../helpers/sorting"));
var additionalData_1 = __importDefault(require("../../helpers/additionalData"));
var notification_1 = __importDefault(require("../rooms/notification"));
var contractInit_1 = __importDefault(require("../../contract-services/contractInit"));
var PublicEvents_json_1 = __importDefault(require("../../contract-services/abi/PublicEvents.json"));
var nonce_1 = __importDefault(require("../../contract-services/nonce/nonce"));
var helpers_1 = __importDefault(require("../../helpers/helpers"));
var getGasPrice_1 = __importDefault(require("../../contract-services/gasPrice/getGasPrice"));
var limits_1 = __importDefault(require("../../config/limits"));
var createEvent = function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var wallet, dateNow, createEventID, eventData, id, startTime, endTime, questionQuantity, amountExperts, calculateExperts, amountPremiumEvent, pathContr, contract, gasEstimate, transaction, _a, _b, allData, type, url, _c, hashtagsId, hostId, roomId, whichRoom, data, room, room, roomId_1, err_1, removeEvent;
    var _d;
    return __generator(this, function (_e) {
        switch (_e.label) {
            case 0:
                req.body.host = req.body.dataFromRedis.id;
                wallet = req.body.dataFromRedis.wallet;
                dateNow = Number((new Date().getTime() / 1000).toFixed(0));
                if (dateNow > req.body.endTime) {
                    res.status(400);
                    res.send("Please check your event end time. This time already passed.");
                    return [2 /*return*/];
                }
                createEventID = [{
                        _id: "publicEvents$newEvents",
                        status: 'id created',
                    }];
                return [4 /*yield*/, axios_1.default.post(path_1.default.path + "/transact", createEventID)
                        .catch(function (err) {
                        console.log("DB error: " + err.response.data.message);
                        res.status(400);
                        res.send(err.response.data.message);
                    })];
            case 1:
                eventData = _e.sent();
                id = eventData.data.tempids["publicEvents$newEvents"];
                _e.label = 2;
            case 2:
                _e.trys.push([2, 18, , 19]);
                startTime = req.body.startTime;
                endTime = req.body.endTime;
                questionQuantity = req.body.answers.length;
                amountExperts = req.body.calculateExperts === "company" ? 0 : req.body.validatorsAmount;
                calculateExperts = req.body.calculateExperts === "company" ? true : false;
                amountPremiumEvent = req.body.amount;
                pathContr = process.env.NODE_ENV;
                return [4 /*yield*/, contractInit_1.default.init(pathContr, PublicEvents_json_1.default)];
            case 3:
                contract = _e.sent();
                return [4 /*yield*/, contract.methods.newEvent(id, startTime, endTime, questionQuantity, amountExperts, calculateExperts, wallet, amountPremiumEvent).estimateGas()];
            case 4:
                gasEstimate = _e.sent();
                _b = (_a = contract.methods.newEvent(id, startTime, endTime, questionQuantity, amountExperts, calculateExperts, wallet, amountPremiumEvent)).send;
                _d = {
                    gas: Number((((gasEstimate * limits_1.default.gasPercent) / 100) + gasEstimate).toFixed(0))
                };
                return [4 /*yield*/, getGasPrice_1.default.getGasPrice()];
            case 5:
                _d.gasPrice = _e.sent();
                return [4 /*yield*/, nonce_1.default.getNonce()];
            case 6: return [4 /*yield*/, _b.apply(_a, [(_d.nonce = _e.sent(),
                        _d)])];
            case 7:
                transaction = _e.sent();
                if (!transaction) return [3 /*break*/, 17];
                allData = req.body;
                delete allData.dataFromRedis;
                if (!(req.body.thumImage != "undefined")) return [3 /*break*/, 9];
                return [4 /*yield*/, helpers_1.default.uploadImage(req.body.thumImage, id)];
            case 8:
                type = _e.sent();
                url = process.env.NODE_ENV == "production" ? "https://api.bettery.io" : "https://apitest.bettery.io";
                allData.thumImage = url + "/image/" + id + "." + type;
                allData.thumColor = undefined;
                return [3 /*break*/, 13];
            case 9:
                if (!(req.body.thumColor != "undefined")) return [3 /*break*/, 10];
                allData.thumImage = undefined;
                return [3 /*break*/, 13];
            case 10:
                if (!(req.body.thumColor === "undefined" && req.body.thumImage === "undefined")) return [3 /*break*/, 13];
                allData.thumImage = undefined;
                if (!(req.body.whichRoom == "new")) return [3 /*break*/, 11];
                allData.thumColor = req.body.roomColor;
                return [3 /*break*/, 13];
            case 11:
                _c = allData;
                return [4 /*yield*/, getRoom_1.default.getRoomColor(allData.roomId)];
            case 12:
                _c.thumColor = _e.sent();
                _e.label = 13;
            case 13:
                hashtagsId = req.body.hashtagsId;
                hostId = allData.host;
                roomId = allData.roomId;
                whichRoom = req.body.whichRoom;
                delete allData.amount;
                delete allData.calculateExperts;
                //TODO add to the history host tokens amount in premium events
                allData.premiumTokens = amountPremiumEvent;
                allData._id = id;
                allData.finalAnswer = "";
                allData.dateCreation = Math.floor(Date.now() / 1000);
                allData.status = "deployed";
                allData.validated = 0;
                allData.transactionHash = transaction.transactionHash;
                data = [];
                // add room
                if (whichRoom == "new") {
                    room = createRoom_1.default.createRoom(allData, "publicEventsId");
                    allData.room = [room._id];
                    delete allData.roomName;
                    delete allData.roomColor;
                    delete allData.whichRoom;
                    delete allData.roomId;
                    data.push(room);
                }
                else {
                    room = {
                        _id: Number(roomId),
                        publicEventsId: [Number(id)]
                    };
                    data.push(room);
                    allData.room = [Number(roomId)];
                    // Add notification
                    notification_1.default.sendNotificationToUser(roomId, id, res);
                    delete allData.roomName;
                    delete allData.roomColor;
                    delete allData.whichRoom;
                    delete allData.roomId;
                }
                if (allData.hashtags.length !== 0) {
                    data.push({
                        _id: hashtagsId,
                        hashtags: allData.hashtags
                    });
                    delete allData['hashtagsId'];
                }
                else {
                    delete allData['hashtagsId'];
                }
                data.push(allData);
                // ADD to host
                data.push({
                    _id: hostId,
                    hostPublicEvents: [id],
                });
                return [4 /*yield*/, axios_1.default.post(path_1.default.path + "/transact", data).catch(function (err) {
                        console.log("DB error: " + err.response.data.message);
                        res.status(400);
                        res.send(err.response.data.message);
                        return;
                    })];
            case 14:
                _e.sent();
                if (!(whichRoom == 'new')) return [3 /*break*/, 16];
                return [4 /*yield*/, getRoomId(id, res)];
            case 15:
                roomId_1 = _e.sent();
                res.status(200).send({
                    roomId: roomId_1,
                    eventId: id
                });
                return [3 /*break*/, 17];
            case 16:
                res.status(200).send({
                    roomId: roomId,
                    eventId: id
                });
                _e.label = 17;
            case 17: return [3 /*break*/, 19];
            case 18:
                err_1 = _e.sent();
                console.log(err_1);
                removeEvent = [{
                        _id: id,
                        _action: 'delete',
                    }];
                axios_1.default.post(path_1.default.path + "/transact", removeEvent)
                    .catch(function (err) {
                    console.log("DB error: " + err.response.data.message);
                    res.status(400);
                    res.send(err.response.data.message);
                });
                res.status(400);
                console.log(err_1.message);
                return [3 /*break*/, 19];
            case 19: return [2 /*return*/];
        }
    });
}); };
var getRoomId = function (eventId, res) { return __awaiter(void 0, void 0, void 0, function () {
    var conf, data;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                conf = {
                    "select": [{ "room": ["_id"] }],
                    "from": eventId
                };
                return [4 /*yield*/, axios_1.default.post(path_1.default.path + "/query", conf).catch(function (err) {
                        console.log("DB error: " + err.response.data.message);
                        res.status(400);
                        res.send(err.response.data.message);
                        return;
                    })];
            case 1:
                data = _a.sent();
                return [2 /*return*/, data.data[0].room[0]['_id']];
        }
    });
}); };
var getById = function (req, res) {
    var id = Number(req.body.id);
    var conf = {
        "select": ["*",
            { 'publicEvents/parcipiantsAnswer': ["*", { "publicActivites/from": ["*"] }] },
            { 'publicEvents/validatorsAnswer': ["*", { "publicActivites/from": ["*"] }] },
            { 'publicEvents/host': ["*"] },
            { 'publicEvents/room': ["*"] }
        ],
        "from": id
    };
    axios_1.default.post(path_1.default.path + "/query", conf).then(function (x) {
        if (x.data.length !== 0) {
            var obj = event_struct_1.default.publicEventStructure([x.data[0]]);
            res.status(200);
            res.send(obj[0]);
        }
        else {
            res.status(404);
            res.send({ message: "event not found" });
        }
    }).catch(function (err) {
        res.status(400);
        res.send(err.response.data.message);
        console.log("DB error: " + err.response.data.message);
    });
};
var getAll = function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var from, to, search, sort, finished, conf, x, obj, dataEvetns, soringData;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                from = req.body.from;
                to = req.body.to;
                search = req.body.search != undefined ? req.body.search : '';
                sort = req.body.sort != undefined ? req.body.sort : 'trending' // controversial 
                ;
                finished = req.body.finished;
                conf = {
                    "select": ["*",
                        { 'publicEvents/parcipiantsAnswer': ["*", { "publicActivites/from": ["*"] }] },
                        { 'publicEvents/validatorsAnswer': ["*", { "publicActivites/from": ["*"] }] },
                        { 'publicEvents/host': ["*"] },
                        { 'publicEvents/room': ["*"] }
                    ],
                    "from": "publicEvents"
                };
                return [4 /*yield*/, axios_1.default.post(path_1.default.path + "/query", conf)
                        .catch(function (err) {
                        res.status(400);
                        res.send(err.response.data.message);
                        console.log("DB error: " + err.response.data.message);
                        return;
                    })];
            case 1:
                x = _a.sent();
                obj = event_struct_1.default.publicEventStructure(x.data);
                dataEvetns = search.length >= 1 ? filter_1.default.searchData(obj, search) : obj;
                if (!finished) {
                    dataEvetns = dataEvetns.filter(function (e) { return e.finalAnswer === null && e.status.search("reverted") == -1; });
                }
                // soring
                switch (sort) {
                    case 'trending':
                        soringData = sorting_1.default.trendingSorting(dataEvetns);
                        sendResponceAllEvents(res, soringData, from, to, obj);
                        break;
                    case 'controversial':
                        soringData = sorting_1.default.controversialSorting(dataEvetns);
                        sendResponceAllEvents(res, soringData, from, to, obj);
                        break;
                }
                return [2 /*return*/];
        }
    });
}); };
var sendResponceAllEvents = function (res, dataEvetns, from, to, obj) { return __awaiter(void 0, void 0, void 0, function () {
    var events;
    var _a;
    return __generator(this, function (_b) {
        switch (_b.label) {
            case 0:
                _a = {
                    allAmountEvents: obj.length,
                    amount: dataEvetns.length
                };
                return [4 /*yield*/, additionalData_1.default.getAdditionalData(dataEvetns.slice(from, to), res)];
            case 1:
                events = (_a.events = _b.sent(),
                    _a);
                res.status(200);
                res.send(events);
                return [2 /*return*/];
        }
    });
}); };
var getBetteryEvent = function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var email, userInfo, getUserInfo, id, conf, data, getLast;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                email = req.body.email;
                if (!(email == undefined)) return [3 /*break*/, 1];
                res.status(400);
                res.send("email is undefined");
                return [3 /*break*/, 4];
            case 1:
                userInfo = {
                    "select": ["_id"],
                    "where": "users/email = \"" + email + "\""
                };
                return [4 /*yield*/, axios_1.default.post(path_1.default.path + "/query", userInfo).catch(function (err) {
                        res.status(400);
                        res.send(err.response.data);
                        return;
                    })];
            case 2:
                getUserInfo = _a.sent();
                if (!getUserInfo) return [3 /*break*/, 4];
                id = getUserInfo.data[0]._id;
                conf = {
                    "select": ["publicEvents/question", "_id", "publicEvents/startTime", "room"],
                    "where": "publicEvents/host = " + id,
                    "opts": { "orderBy": ["DESC", "publicEvents/startTime"] }
                };
                return [4 /*yield*/, axios_1.default.post(path_1.default.path + "/query", conf).catch(function (err) {
                        res.status(400);
                        res.send(err.response.data);
                        return;
                    })];
            case 3:
                data = _a.sent();
                if (data) {
                    getLast = data.data.slice(Math.max(data.data.length - 5, 0));
                    res.status(200);
                    res.send(getLast);
                }
                _a.label = 4;
            case 4: return [2 /*return*/];
        }
    });
}); };
var getAllForTest = function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var conf, x, obj;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                conf = {
                    "select": ["*",
                        { 'publicEvents/parcipiantsAnswer': ["*", { "publicActivites/from": ["*"] }] },
                        { 'publicEvents/validatorsAnswer': ["*", { "publicActivites/from": ["*"] }] },
                        { 'publicEvents/host': ["*"] },
                        { 'publicEvents/room': ["*"] }
                    ],
                    "from": "publicEvents"
                };
                return [4 /*yield*/, axios_1.default.post(path_1.default.path + "/query", conf)
                        .catch(function (err) {
                        res.status(400);
                        res.send(err.response.data.message);
                        console.log("DB error: " + err.response.data.message);
                        return;
                    })];
            case 1:
                x = _a.sent();
                obj = event_struct_1.default.publicEventStructure(x.data);
                res.status(200);
                res.send(obj);
                return [2 /*return*/];
        }
    });
}); };
module.exports = {
    createEvent: createEvent,
    getById: getById,
    getAll: getAll,
    getBetteryEvent: getBetteryEvent,
    getAllForTest: getAllForTest
};
