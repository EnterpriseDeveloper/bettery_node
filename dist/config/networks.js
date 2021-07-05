"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
var key_1 = __importDefault(require("./key"));
// Matic main
var maticMain = "https://angry-jepsen:aliens-swore-bagful-mulled-judge-hummus@nd-166-193-145.p2pify.com";
var matciMainWSS = "wss://angry-jepsen:aliens-swore-bagful-mulled-judge-hummus@ws-nd-166-193-145.p2pify.com";
var maticMainId = 137;
// Mumbai
var maticMumbaiHttps = 'https://competent-panini:demise-sphere-refuse-spoils-down-fiber@nd-425-039-881.p2pify.com';
var maticMumbaiWSS = 'wss://competent-panini:demise-sphere-refuse-spoils-down-fiber@ws-nd-425-039-881.p2pify.com';
var maticMumbaiId = 80001;
// Goerli
var goerli = "https://goerli.infura.io/v3/" + key_1.default.infura;
var mainId = 5;
// Main Ether
var mainnet = "https://mainnet.infura.io/v3/" + key_1.default.infura;
var mainnetID = 1;
// Gas estimation
var gasEstimationMumbaiAPI = 'https://gasstation-mumbai.matic.today';
var gasEstimationMainAPI = "https://gasstation-mainnet.matic.network";
module.exports = {
    goerli: goerli,
    maticMumbaiWSS: maticMumbaiWSS,
    matciMainWSS: matciMainWSS,
    maticMumbaiHttps: maticMumbaiHttps,
    mainId: mainId,
    maticMumbaiId: maticMumbaiId,
    gasEstimationMumbaiAPI: gasEstimationMumbaiAPI,
    mainnet: mainnet,
    mainnetID: mainnetID,
    maticMain: maticMain,
    maticMainId: maticMainId,
    gasEstimationMainAPI: gasEstimationMainAPI
};
