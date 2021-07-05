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
// @ts-nocheck
var web3_1 = __importDefault(require("web3"));
var QuizeTokenSale_json_1 = __importDefault(require("../abi/QuizeTokenSale.json"));
var BTYmain_json_1 = __importDefault(require("../abi/BTYmain.json")); // TODO rename
var networks_1 = __importDefault(require("../../config/networks"));
function BetteryContract(provider, networkId, keys) {
    return __awaiter(this, void 0, void 0, function () {
        var _a, web3, account, abi, address;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0: return [4 /*yield*/, connectToContract(provider, keys)];
                case 1:
                    _a = _b.sent(), web3 = _a.web3, account = _a.account;
                    abi = BTYmain_json_1.default.abi;
                    address = BTYmain_json_1.default.networks[networkId].address;
                    return [2 /*return*/, new web3.eth.Contract(abi, address, { from: account })];
            }
        });
    });
}
function tokenSale(provider, networkId, keys) {
    return __awaiter(this, void 0, void 0, function () {
        var _a, web3, account, abi, address;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0: return [4 /*yield*/, connectToContract(provider, keys)];
                case 1:
                    _a = _b.sent(), web3 = _a.web3, account = _a.account;
                    abi = QuizeTokenSale_json_1.default.abi;
                    address = QuizeTokenSale_json_1.default.networks[networkId].address;
                    return [2 /*return*/, new web3.eth.Contract(abi, address, { from: account })];
            }
        });
    });
}
function connectToContract(provider, keys) {
    return __awaiter(this, void 0, void 0, function () {
        var web3, prKey, accounts, account;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    web3 = new web3_1.default(provider);
                    prKey = web3.eth.accounts.privateKeyToAccount('0x' + keys.key);
                    return [4 /*yield*/, web3.eth.accounts.wallet.add(prKey)];
                case 1:
                    _a.sent();
                    return [4 /*yield*/, web3.eth.accounts.wallet];
                case 2:
                    accounts = _a.sent();
                    account = accounts[0].address;
                    return [2 /*return*/, { web3: web3, account: account }];
            }
        });
    });
}
module.exports = function (app) {
    // TODO
    app.post("/tokensale/info", function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
        var from, provider, networkId, keys, tokenMarket, tokenSold, price, betteryToken, balance, web3;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    from = req.body.from;
                    provider = from == "prod" ? networks_1.default.mainnet : networks_1.default.goerli;
                    networkId = from == "prod" ? networks_1.default.mainnetID : networks_1.default.mainId;
                    keys = from == "prod" ? require("../keys/prod/privKey") : require("../keys/test/privKey");
                    return [4 /*yield*/, tokenSale(provider, networkId, keys)];
                case 1:
                    tokenMarket = _a.sent();
                    return [4 /*yield*/, tokenMarket.methods.tokensSold().call()];
                case 2:
                    tokenSold = _a.sent();
                    return [4 /*yield*/, tokenMarket.methods.tokenPrice().call()];
                case 3:
                    price = _a.sent();
                    return [4 /*yield*/, BetteryContract(provider, networkId, keys)];
                case 4:
                    betteryToken = _a.sent();
                    return [4 /*yield*/, betteryToken.methods.balanceOf(QuizeTokenSale_json_1.default.networks[networkId].address).call()];
                case 5:
                    balance = _a.sent();
                    web3 = new web3_1.default();
                    res.status(200);
                    res.send({
                        price: web3.utils.fromWei(price, "mwei"),
                        tokenSold: web3.utils.fromWei(tokenSold, "ether"),
                        balance: web3.utils.fromWei(balance, "ether"),
                        currencyType: "USDT"
                    });
                    return [2 /*return*/];
            }
        });
    }); });
};
