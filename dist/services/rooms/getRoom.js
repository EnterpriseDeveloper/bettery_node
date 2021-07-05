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
var room_struct_1 = __importDefault(require("../../structure/room.struct"));
var getByUserId = function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var userId, getRooms, rooms, obj, data;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                userId = req.body.dataFromRedis.id;
                getRooms = {
                    "select": ["*", { 'room/owner': ["users/nickName", "users/avatar"] }],
                    "where": "room/owner = " + Number(userId)
                };
                return [4 /*yield*/, axios_1.default.post(path_1.default.path + "/query", getRooms).catch(function (err) {
                        res.status(400);
                        res.send(err.response.data.message);
                        console.log("DB error: " + err.response.data.message);
                        return;
                    })];
            case 1:
                rooms = _a.sent();
                obj = room_struct_1.default.roomStruct(rooms.data);
                data = obj.filter(function (x) { return x.publicEventsId.length != 0; });
                res.status(200);
                res.send(data);
                return [2 /*return*/];
        }
    });
}); };
var getAllRooms = function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var getRooms, rooms, obj, data, i;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                getRooms = {
                    "select": ["*", { 'room/owner': ["users/nickName", "users/avatar"] }],
                    "from": "room"
                };
                return [4 /*yield*/, axios_1.default.post(path_1.default.path + "/query", getRooms).catch(function (err) {
                        res.status(400);
                        res.send(err.response.data.message);
                        console.log("DB error: " + err.response.data.message);
                        return;
                    })];
            case 1:
                rooms = _a.sent();
                obj = room_struct_1.default.roomStruct(rooms.data);
                data = obj.filter(function (x) { return x.publicEventsId.length != 0; });
                for (i = 0; i < data.length; i++) {
                    data[i].publicEventsId = data[i].publicEventsId.reverse();
                }
                res.status(200);
                res.send(data);
                return [2 /*return*/];
        }
    });
}); };
var roomValidation = function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var roomName, userId, findRoom, rooms, findUser;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                roomName = req.body.name;
                userId = req.body.dataFromRedis.id;
                findRoom = {
                    "select": ["*"],
                    "where": "room/owner = " + Number(userId)
                };
                return [4 /*yield*/, axios_1.default.post(path_1.default.path + "/query", findRoom).catch(function (err) {
                        res.status(400);
                        res.send(err.response.data.message);
                        console.log("DB error: " + err.response.data.message);
                        return;
                    })];
            case 1:
                rooms = _a.sent();
                if (rooms.data.length !== 0) {
                    findUser = rooms.data.find(function (x) { return x['room/name'] == roomName; });
                    if (findUser !== undefined) {
                        res.status(400);
                        res.send({ message: "room with this name already exist" });
                    }
                    else {
                        res.status(200);
                        res.send({ message: "ok" });
                    }
                }
                else {
                    res.status(200);
                    res.send({ message: "ok" });
                }
                return [2 /*return*/];
        }
    });
}); };
var getJoinedRoom = function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var id, allRooms, config, rooms, obj, data;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                id = req.body.dataFromRedis.id;
                allRooms = [];
                config = {
                    "select": [{ "users/joinedRooms": [{ "joinRoom/roomId": ["*", { 'room/owner': ["*"] }] }] }],
                    "from": Number(id)
                };
                return [4 /*yield*/, axios_1.default.post(path_1.default.path + "/query", config).catch(function (err) {
                        res.status(400);
                        res.send(err.response.data.message);
                        console.log("DB error: " + err.response.data.message);
                        return;
                    })];
            case 1:
                rooms = _a.sent();
                if (rooms.data[0]['users/joinedRooms'] !== undefined) {
                    rooms.data[0]['users/joinedRooms'].forEach(function (x) {
                        allRooms.push(x['joinRoom/roomId']);
                    });
                    obj = room_struct_1.default.roomStruct(allRooms);
                    data = obj.filter(function (x) { return x.publicEventsId.length != 0; });
                    res.status(200);
                    res.send(data);
                }
                else {
                    res.status(200);
                    res.send([]);
                }
                return [2 /*return*/];
        }
    });
}); };
var getRoomColor = function (id) { return __awaiter(void 0, void 0, void 0, function () {
    var config, data;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                config = {
                    "select": ["room/roomColor"],
                    "from": Number(id)
                };
                return [4 /*yield*/, axios_1.default.post(path_1.default.path + "/query", config).catch(function (err) {
                        console.log("err from get room color: " + err.response);
                        return;
                    })];
            case 1:
                data = _a.sent();
                return [2 /*return*/, data.data[0]["room/roomColor"]];
        }
    });
}); };
module.exports = {
    getByUserId: getByUserId,
    roomValidation: roomValidation,
    getAllRooms: getAllRooms,
    getJoinedRoom: getJoinedRoom,
    getRoomColor: getRoomColor
};
