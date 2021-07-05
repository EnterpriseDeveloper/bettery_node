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
var getAllCommentsById = function (msg) { return __awaiter(void 0, void 0, void 0, function () {
    var eventType, conf, getComments;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0: return [4 /*yield*/, createComments_1.default.eventType(msg)];
            case 1:
                eventType = _a.sent();
                conf = {
                    "select": ["*", {
                            'comments/from': ["users/nickName", "users/avatar"],
                            'comments/wink': ["*", { 'commentsIconActivites/from': ["*"] }],
                            'comments/angry': ["*", { 'commentsIconActivites/from': ["*"] }],
                            'comments/smile': ["*", { 'commentsIconActivites/from': ["*"] }],
                            'comments/star': ["*", { 'commentsIconActivites/from': ["*"] }],
                            'comments/reply': ["*", { 'comments/from': ["users/nickName", "users/avatar"] }]
                        }],
                    "where": "comments/" + eventType + " = " + Number(msg)
                };
                return [4 /*yield*/, axios_1.default.post(path_1.default.path + "/query", conf).catch(function (err) {
                        console.log(err);
                    })];
            case 2:
                getComments = _a.sent();
                if (getComments) {
                    if (getComments.data.length != 0) {
                        return [2 /*return*/, commentsStructure(getComments.data)];
                    }
                    else {
                        return [2 /*return*/, []];
                    }
                }
                return [2 /*return*/];
        }
    });
}); };
var commentsStructure = function (comments) {
    return comments.map(function (x) {
        return {
            id: x['_id'],
            comment: x['comments/comment'],
            date: x['comments/date'],
            wink: x['comments/wink'] == undefined ? [] : activitesStructure(x['comments/wink']),
            angry: x['comments/angry'] == undefined ? [] : activitesStructure(x['comments/angry']),
            smile: x['comments/smile'] == undefined ? [] : activitesStructure(x['comments/smile']),
            star: x['comments/star'] == undefined ? [] : activitesStructure(x['comments/star']),
            user: {
                id: x['comments/from']._id,
                nickName: x['comments/from']['users/nickName'],
                avatar: x['comments/from']['users/avatar']
            },
            replies: x['comments/reply'] == undefined ? [] : replyStructure(x['comments/reply']),
            activites: (x['comments/wink'] == undefined ? 0 : x['comments/wink'].length) +
                (x['comments/angry'] == undefined ? 0 : x['comments/angry'].length) +
                (x['comments/smile'] == undefined ? 0 : x['comments/smile'].length) +
                (x['comments/star'] == undefined ? 0 : x['comments/star'].length)
        };
    });
};
var replyStructure = function (x) {
    return x.map(function (z) {
        return {
            id: z['_id'],
            date: z['comments/date'],
            user: {
                id: z['comments/from']._id,
                nickName: z['comments/from']['users/nickName'],
                avatar: z['comments/from']['users/avatar']
            },
        };
    });
};
var activitesStructure = function (x) {
    return x.map(function (z) {
        return {
            id: z['_id'],
            date: z['commentsIconActivites/date'],
            user: {
                id: z['commentsIconActivites/from']._id,
                nickName: z['commentsIconActivites/from']['users/nickName'],
                avatar: z['commentsIconActivites/from']['users/avatar']
            }
        };
    });
};
module.exports = {
    getAllCommentsById: getAllCommentsById
};
