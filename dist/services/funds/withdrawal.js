"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
var axios_1 = __importDefault(require("axios"));
var path_1 = __importDefault(require("../../config/path"));
var setInitWithd = function (req, res) {
    var data = [{
            "_id": "withdrawal$newWithdrawal",
            "userId": req.body.dataFromRedis.id,
            "date": Math.floor(Date.now() / 1000),
            "transactionHash": req.body.transactionHash,
            "status": "pending",
            "amount": req.body.amount
        }];
    axios_1.default.post(path_1.default.path + "/transact", data).then(function () {
        res.status(200);
        res.send({ "status": "done" });
    }).catch(function (err) {
        res.status(400);
        res.send(err.response.data.message);
    });
};
var getWithdInfo = function (req, res) {
    // TODO
};
module.exports = {
    setInitWithd: setInitWithd,
    getWithdInfo: getWithdInfo
};
