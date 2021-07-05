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
var event_struct_1 = __importDefault(require("../../structure/event.struct"));
var filter_1 = __importDefault(require("../../helpers/filter"));
var getEventByRoomId = function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var id, from, to, search, eventData, roomEvent, dataEvetns, events;
    var _a;
    return __generator(this, function (_b) {
        switch (_b.label) {
            case 0:
                id = req.body.id;
                from = req.body.from;
                to = req.body.to;
                search = req.body.search != undefined ? req.body.search : '';
                return [4 /*yield*/, getData(id, res)];
            case 1:
                eventData = _b.sent();
                if (!(eventData !== undefined)) return [3 /*break*/, 3];
                roomEvent = event_struct_1.default.publicEventStructure(eventData.data);
                dataEvetns = search.length >= 1 ? filter_1.default.searchData(roomEvent, search) : roomEvent;
                _a = {
                    allAmountEvents: roomEvent.length,
                    amount: dataEvetns.length
                };
                return [4 /*yield*/, getCommentsAmount(dataEvetns.slice(from, to), res)];
            case 2:
                events = (_a.events = _b.sent(),
                    _a);
                res.status(200);
                res.send(events);
                _b.label = 3;
            case 3: return [2 /*return*/];
        }
    });
}); };
var getCommentsAmount = function (events, res) { return __awaiter(void 0, void 0, void 0, function () {
    var i, conf, comments;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                i = 0;
                _a.label = 1;
            case 1:
                if (!(i < events.length)) return [3 /*break*/, 4];
                conf = {
                    "select": ["comments/comment", "comments/date"],
                    "where": "comments/publicEventsId = " + Number(events[i].id),
                    "opts": { "orderBy": ["DESC", "comments/date"] }
                };
                return [4 /*yield*/, axios_1.default.post(path_1.default.path + "/query", conf)
                        .catch(function (err) {
                        res.status(400);
                        res.send(err.response);
                        console.log("DB error: " + err.response);
                        return;
                    })];
            case 2:
                comments = _a.sent();
                events[i].commentsAmount = comments.data.length;
                if (comments.data.length != 0) {
                    events[i].lastComment = comments.data[0]['comments/comment'];
                }
                else {
                    events[i].lastComment = "null";
                }
                _a.label = 3;
            case 3:
                i++;
                return [3 /*break*/, 1];
            case 4: return [2 /*return*/, events];
        }
    });
}); };
var roomInfo = function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var roomId, userId, eventData, hostData, joined, room;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                roomId = req.body.roomId;
                userId = req.body.userId;
                return [4 /*yield*/, getData(roomId, res)];
            case 1:
                eventData = _a.sent();
                return [4 /*yield*/, getHostData(roomId, res)];
            case 2:
                hostData = _a.sent();
                joined = findJoined(userId, hostData[0]['room/joinedUsers']);
                if (eventData !== undefined) {
                    room = {
                        name: eventData.data[0]["publicEvents/room"][0]["room/name"],
                        color: eventData.data[0]["publicEvents/room"][0]["room/color"],
                        hostId: hostData[0]['room/owner']['_id'],
                        host: hostData[0]['room/owner']['users/nickName'],
                        hostAvatar: hostData[0]['room/owner']['users/avatar'],
                        events: eventData.data.length,
                        activeEvents: getActiveEvents(eventData.data),
                        members: hostData[0]['room/joinedUsers'] == undefined ? 0 : hostData[0]['room/joinedUsers'].length,
                        joined: joined == undefined ? false : true,
                        notifications: joined == undefined ? undefined : joined['joinRoom/notifications'],
                        joinedId: joined == undefined ? undefined : joined["_id"]
                    };
                    res.status(200);
                    res.send(room);
                }
                return [2 /*return*/];
        }
    });
}); };
var findJoined = function (userId, data) {
    if (data) {
        return data.find(function (x) { return x['joinRoom/userId']["_id"] == userId; });
    }
    else {
        return undefined;
    }
};
var getActiveEvents = function (data) {
    var events = data.filter(function (x) {
        return x['publicEvents/finalAnswerNumber'] == undefined && x['publicEvents/status'].search("reverted") == -1;
    });
    return events.length;
};
var getHostData = function (id, res) { return __awaiter(void 0, void 0, void 0, function () {
    var host, hostData;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                host = {
                    "select": ["*",
                        {
                            "room/joinedUsers": ["*"],
                            "room/owner": ["*"]
                        }
                    ],
                    "from": id,
                };
                return [4 /*yield*/, axios_1.default.post(path_1.default.path + "/query", host).catch(function (err) {
                        res.status(404);
                        res.send({ message: err });
                        return undefined;
                    })];
            case 1:
                hostData = _a.sent();
                return [2 /*return*/, hostData.data];
        }
    });
}); };
var getData = function (id, res) { return __awaiter(void 0, void 0, void 0, function () {
    var event, eventData;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                event = {
                    "select": ["*",
                        { 'publicEvents/parcipiantsAnswer': ["*", { "publicActivites/from": ["*"] }] },
                        { 'publicEvents/validatorsAnswer': ["*", { "publicActivites/from": ["*"] }] },
                        { 'publicEvents/host': ["*"] },
                        { 'publicEvents/room': ["*"] }
                    ],
                    "where": "publicEvents/room = " + Number(id),
                    "opts": { "orderBy": ["DESC", "publicEvents/startTime"] }
                };
                return [4 /*yield*/, axios_1.default.post(path_1.default.path + "/query", event).catch(function (err) {
                        res.status(404);
                        res.send({ message: err });
                        return undefined;
                    })];
            case 1:
                eventData = _a.sent();
                return [2 /*return*/, eventData];
        }
    });
}); };
module.exports = {
    getEventByRoomId: getEventByRoomId,
    roomInfo: roomInfo
};
