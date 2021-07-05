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
var users_1 = __importDefault(require("./users"));
var torusRegist_1 = __importDefault(require("./torusRegist"));
var myActivites_1 = __importDefault(require("./myActivites"));
var linkAccount_1 = __importDefault(require("../../helpers/auth0/linkAccount"));
var check_token_1 = __importDefault(require("../../middlewares/check-token"));
module.exports = function (app) {
    app.post("/user/getUserById", check_token_1.default, function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
        return __generator(this, function (_a) {
            users_1.default.getUserById(req, res);
            return [2 /*return*/];
        });
    }); });
    app.get("/user/all", function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
        return __generator(this, function (_a) {
            users_1.default.allUsers(req, res);
            return [2 /*return*/];
        });
    }); });
    app.post("/user/torus_regist", function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
        return __generator(this, function (_a) {
            torusRegist_1.default.torusRegist(req, res);
            return [2 /*return*/];
        });
    }); });
    app.post("/user/event_activites", function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, myActivites_1.default.getAllUserEvents(req, res)];
                case 1:
                    _a.sent();
                    return [2 /*return*/];
            }
        });
    }); });
    app.post("/user/get_additional_info", function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, users_1.default.additionalInfo(req, res)];
                case 1:
                    _a.sent();
                    return [2 /*return*/];
            }
        });
    }); });
    app.post("/user/link_account", check_token_1.default, function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, linkAccount_1.default.linkAccount(req, res)];
                case 1:
                    _a.sent();
                    return [2 /*return*/];
            }
        });
    }); });
    app.post("/user/update_nickname", check_token_1.default, function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, users_1.default.updateNickname(req, res)];
                case 1:
                    _a.sent();
                    return [2 /*return*/];
            }
        });
    }); });
    app.post("/user/update_public_email", check_token_1.default, function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, users_1.default.updatePublicEmail(req, res)];
                case 1:
                    _a.sent();
                    return [2 /*return*/];
            }
        });
    }); });
    app.post("/user/auto_login", function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, torusRegist_1.default.autoLogin(req, res)];
                case 1:
                    _a.sent();
                    return [2 /*return*/];
            }
        });
    }); });
    app.get("/user/logout", check_token_1.default, function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, torusRegist_1.default.logout(req, res)];
                case 1:
                    _a.sent();
                    return [2 /*return*/];
            }
        });
    }); });
    app.get("/user/delete_account", function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
        return __generator(this, function (_a) {
            // TODO
            res.status(200);
            res.send({ status: "ok" });
            return [2 /*return*/];
        });
    }); });
};
