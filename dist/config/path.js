"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
var key_1 = __importDefault(require("./key"));
var ip = process.env.NODE_ENV == "production" ? key_1.default.APIprod : key_1.default.APItest;
var path = "http://" + ip + "/fdb/demo/quize";
module.exports = {
    path: path
};
