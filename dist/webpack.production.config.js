"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
var webpack_1 = __importDefault(require("webpack"));
var path_1 = __importDefault(require("path"));
var fs_1 = __importDefault(require("fs"));
var nodeModules = {};
new webpack_1.default.DefinePlugin({
    'process.env': {
        'NODE_ENV': JSON.stringify('production'),
        'NODE_TEST': JSON.stringify('false')
    }
});
fs_1.default.readdirSync('node_modules')
    .filter(function (x) {
    return ['.bin'].indexOf(x) === -1;
})
    .forEach(function (mod) {
    nodeModules[mod] = 'commonjs ' + mod;
});
module.exports = {
    entry: './index.js',
    target: 'node',
    output: {
        path: path_1.default.join(__dirname, ''),
        filename: 'server_prod.js'
    },
    externals: nodeModules
};
