const findCorrectAnswer = require("./findCorrectAnswer");
const payToCompanies = require("./payToCompanies");
const payToExperts = require("./payToExperts");
const payToHost = require("./payToHost");
const payToLosers = require("./playerPayment/payToLosers");
const payToPlayers = require("./playerPayment/payToPlayers");
const payToRefferers = require("./payToRefferers");
const reverted = require("./reverted");

module.exports = {
    findCorrectAnswer,
    payToCompanies,
    payToExperts,
    payToHost,
    payToLosers,
    payToPlayers,
    payToRefferers,
    reverted
}