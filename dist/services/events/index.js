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
Object.defineProperty(exports, "__esModule", { value: true });
var publicEvents_1 = __importDefault(require("./publicEvents"));
var privateEvents_1 = __importDefault(require("./privateEvents"));
var hashtags_1 = __importDefault(require("./hashtags"));
var publicActivites_1 = __importDefault(require("./publicActivites"));
var eventLimitsPrivate_1 = __importDefault(require("../../middlewares/eventLimitsPrivate"));
var eventLimitsPublic_1 = __importDefault(require("../../middlewares/eventLimitsPublic"));
var revert_1 = __importDefault(require("./revert"));
var findCorrectAnswer_1 = __importDefault(require("../../contract-services/publicEvents/findCorrectAnswer"));
var check_token_1 = __importDefault(require("../../middlewares/check-token"));
module.exports = function (app) {
    app.post("/publicEvents/createEvent", check_token_1.default, eventLimitsPublic_1.default, function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
        return __generator(this, function (_a) {
            publicEvents_1.default.createEvent(req, res);
            return [2 /*return*/];
        });
    }); });
    app.post("/publicEvents/get_by_id", function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
        return __generator(this, function (_a) {
            publicEvents_1.default.getById(req, res);
            return [2 /*return*/];
        });
    }); });
    app.post("/publicEvents/get_all", function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
        return __generator(this, function (_a) {
            publicEvents_1.default.getAll(req, res);
            return [2 /*return*/];
        });
    }); });
    app.get("/publicEvents/get_all_for_test", function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
        return __generator(this, function (_a) {
            publicEvents_1.default.getAllForTest(req, res);
            return [2 /*return*/];
        });
    }); });
    app.post("/publicEvents/participate", check_token_1.default, function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
        return __generator(this, function (_a) {
            publicActivites_1.default.participate(req, res);
            return [2 /*return*/];
        });
    }); });
    app.post("/publicEvents/validate", check_token_1.default, function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
        return __generator(this, function (_a) {
            publicActivites_1.default.validate(req, res);
            return [2 /*return*/];
        });
    }); });
    app.post("/privateEvents/createEvent", check_token_1.default, eventLimitsPrivate_1.default, function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
        return __generator(this, function (_a) {
            privateEvents_1.default.createPrivateEvent(req, res);
            return [2 /*return*/];
        });
    }); });
    app.post("/privateEvents/get_by_id", function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
        return __generator(this, function (_a) {
            privateEvents_1.default.getById(req, res);
            return [2 /*return*/];
        });
    }); });
    app.post("/privateEvents/participate", check_token_1.default, function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
        return __generator(this, function (_a) {
            privateEvents_1.default.participate(req, res);
            return [2 /*return*/];
        });
    }); });
    app.post("/privateEvents/validate", check_token_1.default, function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
        return __generator(this, function (_a) {
            privateEvents_1.default.validate(req, res);
            return [2 /*return*/];
        });
    }); });
    app.get("/hashtags/get_all", function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
        return __generator(this, function (_a) {
            hashtags_1.default.getAllHashtags(req, res);
            return [2 /*return*/];
        });
    }); });
    app.post("/publicEvents/revert", function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
        return __generator(this, function (_a) {
            revert_1.default.getEventData(req, res);
            return [2 /*return*/];
        });
    }); });
    app.post("/bettery_event", function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
        return __generator(this, function (_a) {
            publicEvents_1.default.getBetteryEvent(req, res);
            return [2 /*return*/];
        });
    }); });
    app.post("/public_event/finishEvent", function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
        var id, data;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    id = req.body.id;
                    data = {
                        id: id
                    };
                    return [4 /*yield*/, findCorrectAnswer_1.default.findCorrectAnswer(data)];
                case 1:
                    _a.sent();
                    res.status(200);
                    res.send({ status: "OK" });
                    return [2 /*return*/];
            }
        });
    }); });
};
