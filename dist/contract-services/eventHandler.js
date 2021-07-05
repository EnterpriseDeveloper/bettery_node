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
var PublicEvents_json_1 = __importDefault(require("./abi/PublicEvents.json"));
var MiddlePayment_json_1 = __importDefault(require("./abi/MiddlePayment.json"));
var PlayerPayment_json_1 = __importDefault(require("./abi/PlayerPayment.json"));
var contractInit_1 = __importDefault(require("./contractInit"));
var exprestCalc_1 = __importDefault(require("./oracels/exprestCalc"));
var event_is_finish_1 = __importDefault(require("../services/events/event_is_finish"));
var index_1 = __importDefault(require("./publicEvents/index"));
var setPaymentToDB_1 = __importDefault(require("./publicEvents/playerPayment/setPaymentToDB"));
var web3_1 = __importDefault(require("web3"));
var hasProviderEnded = false;
var loadHandler = function () { return __awaiter(void 0, void 0, void 0, function () {
    var path, _a, provider, networkId, web3, publicEvent, mpEvent, ppEvent;
    return __generator(this, function (_b) {
        switch (_b.label) {
            case 0:
                path = process.env.NODE_ENV;
                _a = contractInit_1.default.webSoketInit(path), provider = _a.provider, networkId = _a.networkId;
                web3 = new web3_1.default(provider);
                return [4 /*yield*/, contractInit_1.default.connectToNetwork(provider, networkId, PublicEvents_json_1.default, path)];
            case 1:
                publicEvent = _b.sent();
                publicEventsHandler(publicEvent);
                return [4 /*yield*/, contractInit_1.default.connectToNetwork(provider, networkId, MiddlePayment_json_1.default, path)];
            case 2:
                mpEvent = _b.sent();
                MiddlePayment(mpEvent);
                return [4 /*yield*/, contractInit_1.default.connectToNetwork(provider, networkId, PlayerPayment_json_1.default, path)];
            case 3:
                ppEvent = _b.sent();
                PlayerPayment(ppEvent);
                hasProviderEnded = false;
                provider.on('error', function (e) {
                    errorDebug('!!!!WS ERROR!!!!', e);
                });
                provider.on('end', function (e) {
                    console.log('!!!!WS CLOSE!!!!');
                    if (hasProviderEnded)
                        return;
                    hasProviderEnded = true;
                    provider.reset();
                    provider.removeAllListeners("connect");
                    provider.removeAllListeners("error");
                    provider.removeAllListeners("end");
                    setTimeout(function () {
                        console.log("RELOAD: ", Math.floor(new Date().getTime() / 1000.0));
                        loadHandler();
                    }, 1000);
                });
                return [2 /*return*/];
        }
    });
}); };
// const checkConnection = (provider, interval) => {
//     if (!provider.currentProvider.connected) {
//         console.log("RELOAD: ", Math.floor(new Date().getTime() / 1000.0))
//         clearInterval(interval);
//         loadHandler();
//         return;
//     } else {
//         return;
//     }
// }
var publicEventsHandler = function (publicEvent) {
    publicEvent.events.calculateExpert(function (err, event) { return __awaiter(void 0, void 0, void 0, function () {
        return __generator(this, function (_a) {
            if (err) {
                errorDebug('Error from calculate expert events', err);
            }
            else {
                console.log("event calculateExpert work");
                exprestCalc_1.default.expertCalc(event.returnValues);
            }
            return [2 /*return*/];
        });
    }); });
    publicEvent.events.findCorrectAnswer(function (err, event) { return __awaiter(void 0, void 0, void 0, function () {
        return __generator(this, function (_a) {
            if (err) {
                errorDebug('Error from find сorrect answer events', err);
            }
            else {
                index_1.default.findCorrectAnswer.findCorrectAnswer(event.returnValues);
            }
            return [2 /*return*/];
        });
    }); });
    publicEvent.events.revertedEvent(function (err, event) { return __awaiter(void 0, void 0, void 0, function () {
        return __generator(this, function (_a) {
            if (err) {
                errorDebug('Error from reverted event', err);
            }
            else {
                console.log("event revertedEvent work");
                index_1.default.reverted.reverted(event.returnValues);
            }
            return [2 /*return*/];
        });
    }); });
};
var MiddlePayment = function (middlePayment) { return __awaiter(void 0, void 0, void 0, function () {
    return __generator(this, function (_a) {
        middlePayment.events.payToCompanies(function (err, event) { return __awaiter(void 0, void 0, void 0, function () {
            return __generator(this, function (_a) {
                if (err) {
                    errorDebug('Error from find pay to companies events', err);
                }
                else {
                    index_1.default.payToCompanies.payToCompanies(event.returnValues);
                }
                return [2 /*return*/];
            });
        }); });
        middlePayment.events.payToHost(function (err, event) { return __awaiter(void 0, void 0, void 0, function () {
            return __generator(this, function (_a) {
                if (err) {
                    errorDebug('Error from find pay to host events', err);
                }
                else {
                    index_1.default.payToHost.payToHost(event.returnValues);
                }
                return [2 /*return*/];
            });
        }); });
        middlePayment.events.payToExperts(function (err, event) { return __awaiter(void 0, void 0, void 0, function () {
            return __generator(this, function (_a) {
                if (err) {
                    errorDebug('Error from find pay to expert events', err);
                }
                else {
                    index_1.default.payToExperts.payToExperts(event.returnValues);
                }
                return [2 /*return*/];
            });
        }); });
        middlePayment.events.payToPlayers(function (err, event) { return __awaiter(void 0, void 0, void 0, function () {
            return __generator(this, function (_a) {
                if (err) {
                    errorDebug('Error from find pay to players events', err);
                }
                else {
                    index_1.default.payToPlayers.payToPlayers(event.returnValues);
                }
                return [2 /*return*/];
            });
        }); });
        middlePayment.events.revertedEvent(function (err, event) { return __awaiter(void 0, void 0, void 0, function () {
            return __generator(this, function (_a) {
                if (err) {
                    errorDebug('Error from reverted event', err);
                }
                else {
                    console.log("event revertedEvent work");
                    index_1.default.reverted.reverted(event.returnValues);
                }
                return [2 /*return*/];
            });
        }); });
        return [2 /*return*/];
    });
}); };
var PlayerPayment = function (playerPayment) { return __awaiter(void 0, void 0, void 0, function () {
    return __generator(this, function (_a) {
        playerPayment.events.payToLosers(function (err, event) { return __awaiter(void 0, void 0, void 0, function () {
            return __generator(this, function (_a) {
                if (err) {
                    errorDebug('Error from find pay to losers events', err);
                }
                else {
                    index_1.default.payToLosers.payToLosers(event.returnValues);
                }
                return [2 /*return*/];
            });
        }); });
        playerPayment.events.payToRefferers(function (err, event) { return __awaiter(void 0, void 0, void 0, function () {
            return __generator(this, function (_a) {
                if (err) {
                    errorDebug('Error from find pay to refferers events', err);
                }
                else {
                    index_1.default.payToRefferers.payToRefferers(event.returnValues);
                }
                return [2 /*return*/];
            });
        }); });
        playerPayment.events.eventFinish(function (err, event) { return __awaiter(void 0, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (!err) return [3 /*break*/, 1];
                        errorDebug('Error from event finish event', err);
                        return [3 /*break*/, 3];
                    case 1:
                        console.log("event finish work");
                        return [4 /*yield*/, setPaymentToDB_1.default.setToDB(event.returnValues)];
                    case 2:
                        _a.sent();
                        event_is_finish_1.default.eventEnd(event.returnValues);
                        _a.label = 3;
                    case 3: return [2 /*return*/];
                }
            });
        }); });
        playerPayment.events.eventMintedFinish(function (err, event) { return __awaiter(void 0, void 0, void 0, function () {
            return __generator(this, function (_a) {
                if (err) {
                    errorDebug('Error from event finish event', err);
                }
                else {
                    console.log("event minted finish work");
                    event_is_finish_1.default.eventEnd(event.returnValues);
                }
                return [2 /*return*/];
            });
        }); });
        return [2 /*return*/];
    });
}); };
var errorDebug = function (from, err) {
    var error = String(err);
    if (error.search("close code `1006`") == -1) {
        console.log(from, err);
    }
};
module.exports = {
    loadHandler: loadHandler
};
