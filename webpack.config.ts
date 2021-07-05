import webpack from 'webpack';
import path from 'path';
import fs from 'fs';

var nodeModules: any = {};

new webpack.DefinePlugin({
  'process.env': {
    'NODE_ENV': JSON.stringify('test'),
    'NODE_TEST': JSON.stringify('false')
  }
});

fs.readdirSync('node_modules')
  .filter(function (x: any) {
    return ['.bin'].indexOf(x) === -1;
  })
  .forEach(function (mod: any) {
    nodeModules[mod] = 'commonjs ' + mod;
  });

export = {
  entry: './index.js',
  target: 'node',
  output: {
    path: path.join(__dirname, ''),
    filename: 'server.js'
  },
  externals: nodeModules
}