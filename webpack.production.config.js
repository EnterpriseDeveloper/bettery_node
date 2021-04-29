var webpack = require('webpack');
var path = require('path');
var fs = require('fs');

var nodeModules = {};

new webpack.DefinePlugin({
    'process.env': {
        'NODE_ENV': JSON.stringify('production'),
        'NODE_TEST': JSON.stringify('false')
    }
}),

    fs.readdirSync('node_modules')
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
        path: path.join(__dirname, ''),
        filename: 'server_prod.js'
    },
    externals: nodeModules
}