"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
var findCorrectAnswer_1 = __importDefault(require("./findCorrectAnswer"));
var payToCompanies_1 = __importDefault(require("./payToCompanies"));
var payToExperts_1 = __importDefault(require("./payToExperts"));
var payToHost_1 = __importDefault(require("./payToHost"));
var payToLosers_1 = __importDefault(require("./playerPayment/payToLosers"));
var payToPlayers_1 = __importDefault(require("./playerPayment/payToPlayers"));
var payToRefferers_1 = __importDefault(require("./payToRefferers"));
var reverted_1 = __importDefault(require("./reverted"));
module.exports = {
    findCorrectAnswer: findCorrectAnswer_1.default,
    payToCompanies: payToCompanies_1.default,
    payToExperts: payToExperts_1.default,
    payToHost: payToHost_1.default,
    payToLosers: payToLosers_1.default,
    payToPlayers: payToPlayers_1.default,
    payToRefferers: payToRefferers_1.default,
    reverted: reverted_1.default
};
