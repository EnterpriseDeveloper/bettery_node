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
var createComments_1 = __importDefault(require("./createComments"));
var iconActivities = function (msg) { return __awaiter(void 0, void 0, void 0, function () {
    var eventId, userId, commentId, type, eventType, findActivites, activites, findEvent, deleteEvent, deleteEvent;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                eventId = msg.eventId;
                userId = msg.userId;
                commentId = msg.commentId;
                type = msg.type;
                return [4 /*yield*/, createComments_1.default.eventType(eventId)];
            case 1:
                eventType = _a.sent();
                findActivites = {
                    "select": ["*"],
                    "where": "commentsIconActivites/commentId = " + Number(commentId)
                };
                return [4 /*yield*/, axios_1.default.post(path_1.default.path + "/query", findActivites).catch(function (err) {
                        console.log(err);
                    })];
            case 2:
                activites = _a.sent();
                if (!activites) return [3 /*break*/, 10];
                findEvent = activites.data.findIndex(function (x) { return x['commentsIconActivites/from']["_id"] == Number(userId); });
                if (!(findEvent !== -1)) return [3 /*break*/, 8];
                if (!(activites.data[findEvent]['commentsIconActivites/type'] == type)) return [3 /*break*/, 4];
                deleteEvent = [{
                        "_id": activites.data[findEvent]["_id"],
                        "_action": "delete"
                    }];
                return [4 /*yield*/, axios_1.default.post(path_1.default.path + "/transact", deleteEvent).catch(function (err) {
                        console.log(err);
                    })];
            case 3:
                _a.sent();
                return [3 /*break*/, 7];
            case 4:
                deleteEvent = [{
                        "_id": activites.data[findEvent]["_id"],
                        "_action": "delete"
                    }];
                return [4 /*yield*/, axios_1.default.post(path_1.default.path + "/transact", deleteEvent).catch(function (err) {
                        console.log(err);
                    })];
            case 5:
                _a.sent();
                return [4 /*yield*/, createNewActivites(eventId, userId, type, commentId, eventType)];
            case 6:
                _a.sent();
                _a.label = 7;
            case 7: return [3 /*break*/, 10];
            case 8: return [4 /*yield*/, createNewActivites(eventId, userId, type, commentId, eventType)];
            case 9:
                _a.sent();
                _a.label = 10;
            case 10: return [2 /*return*/];
        }
    });
}); };
var createNewActivites = function (eventId, userId, type, commentId, eventType) { return __awaiter(void 0, void 0, void 0, function () {
    var data;
    var _a, _b;
    return __generator(this, function (_c) {
        switch (_c.label) {
            case 0:
                data = [(_a = {
                            _id: "commentsIconActivites$newActivites"
                        },
                        _a[eventType] = eventId,
                        _a.date = Math.floor(Date.now() / 1000),
                        _a.from = userId,
                        _a.type = type,
                        _a.commentId = commentId,
                        _a), (_b = {
                            _id: commentId
                        },
                        _b[type] = ["commentsIconActivites$newActivites"],
                        _b)];
                return [4 /*yield*/, axios_1.default.post(path_1.default.path + "/transact", data).catch(function (err) {
                        console.log(err);
                    })];
            case 1:
                _c.sent();
                return [2 /*return*/];
        }
    });
}); };
module.exports = {
    iconActivities: iconActivities,
};
