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
var notification_struct_1 = __importDefault(require("../../structure/notification.struct"));
var subscribeToNotification = function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var joinedId, subscribe, config;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                joinedId = req.body.joinedId;
                subscribe = req.body.subscribe;
                config = [{
                        "_id": Number(joinedId),
                        "notifications": subscribe
                    }];
                return [4 /*yield*/, axios_1.default.post(path_1.default.path + "/transact", config).catch(function (err) {
                        res.status(400);
                        res.send(err.response.data.message);
                        console.log("DB error: " + err.response.data.message);
                        return;
                    })];
            case 1:
                _a.sent();
                res.status(200);
                res.send({ status: subscribe == true ? "Subscribed" : "Unsubscribed" });
                return [2 /*return*/];
        }
    });
}); };
var sendNotificationToUser = function (roomId, eventId, res) { return __awaiter(void 0, void 0, void 0, function () {
    var sendData, config, getData, i, data, notifications;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                sendData = [];
                config = {
                    "select": [{ "joinedUsers": ["*"] }],
                    "from": Number(roomId),
                };
                return [4 /*yield*/, axios_1.default.post(path_1.default.path + "/query", config).catch(function (err) {
                        res.status(400);
                        res.send(err.response.data.message);
                        console.log("DB error: " + err.response.data.message);
                        return;
                    })];
            case 1:
                getData = _a.sent();
                if (!(getData.data[0].joinedUsers !== undefined)) return [3 /*break*/, 3];
                for (i = 0; i < getData.data[0].joinedUsers.length; i++) {
                    data = getData.data[0].joinedUsers[i];
                    notifications = data['joinRoom/notifications'];
                    if (notifications) {
                        sendData.push({
                            "_id": "notificationFromRoom$newNotification" + i,
                            "joinRoomId": data["_id"],
                            "publicEventsId": Number(eventId),
                            "userId": data["joinRoom/userId"]["_id"],
                            "date": Math.floor(Date.now() / 1000),
                            "read": false
                        }, {
                            "_id": data["joinRoom/userId"]["_id"],
                            "notificationFromRoom": ["notificationFromRoom$newNotification" + i],
                        });
                    }
                }
                return [4 /*yield*/, axios_1.default.post(path_1.default.path + "/transact", sendData).catch(function (err) {
                        res.status(400);
                        res.send(err.response.data.message);
                        console.log("DB error: " + err.response.data.message);
                        return;
                    })];
            case 2:
                _a.sent();
                _a.label = 3;
            case 3: return [2 /*return*/];
        }
    });
}); };
var getNotificationByUserId = function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var userId, config, getData, data, notif;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                userId = req.body.dataFromRedis.id;
                config = {
                    "select": [
                        {
                            "notificationFromRoom": ["*",
                                {
                                    'notificationFromRoom/publicEventsId': ['publicEvents/endTime',
                                        { 'publicEvents/host': ["_id", "users/nickName", "users/avatar"] },
                                        { 'publicEvents/room': ["_id"] }]
                                }]
                        }
                    ],
                    "from": Number(userId),
                    "opts": { "orderBy": ["DESC", "notificationFromRoom/date"] }
                };
                return [4 /*yield*/, axios_1.default.post(path_1.default.path + "/query", config).catch(function (err) {
                        res.status(400);
                        res.send(err.response.data.message);
                        console.log("DB error: " + err.response.data.message);
                        return;
                    })];
            case 1:
                getData = _a.sent();
                data = getData.data[0].notificationFromRoom;
                if (data != undefined) {
                    notif = notification_struct_1.default.notificationStruct(data);
                    res.status(200);
                    res.send(notif);
                }
                else {
                    res.status(200);
                    res.send([]);
                }
                return [2 /*return*/];
        }
    });
}); };
var readNotification = function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var id, data;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                id = req.body.id;
                data = [];
                id.forEach(function (x) {
                    data.push({
                        "_id": x,
                        "read": true
                    });
                });
                return [4 /*yield*/, axios_1.default.post(path_1.default.path + "/transact", data).catch(function (err) {
                        res.status(400);
                        res.send(err.response.data.message);
                        console.log("DB error: " + err.response.data.message);
                        return;
                    })];
            case 1:
                _a.sent();
                res.status(200);
                res.send({ status: "ok" });
                return [2 /*return*/];
        }
    });
}); };
var deleteNotifications = function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var id, data;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                id = req.body.id;
                data = [];
                id.forEach(function (x) {
                    data.push({
                        "_id": x,
                        "_action": "delete"
                    });
                });
                return [4 /*yield*/, axios_1.default.post(path_1.default.path + "/transact", data).catch(function (err) {
                        res.status(400);
                        res.send(err.response.data.message);
                        console.log("DB error: " + err.response.data.message);
                        return;
                    })];
            case 1:
                _a.sent();
                res.status(200);
                res.send({ status: "ok" });
                return [2 /*return*/];
        }
    });
}); };
module.exports = {
    subscribeToNotification: subscribeToNotification,
    sendNotificationToUser: sendNotificationToUser,
    getNotificationByUserId: getNotificationByUserId,
    readNotification: readNotification,
    deleteNotifications: deleteNotifications
};
