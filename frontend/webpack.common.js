const path = require('path'),
      CopyWebpackPlugin = require('copy-webpack-plugin');

module.exports = {
  entry: './src/index.tsx',
  output: {
    path: path.resolve('build'),
    filename: 'js/[name].bundle.js'
  },
  resolve: {
    modules: ['./build', './src', 'node_modules'],
    extensions: ['.js', '.jsx', '.json', '.ts', '.tsx']
  },
  module: {
    exprContextCritical: false,
    rules: [{
      test: /\.ts$/,
      enforce: 'pre',
      loader: 'tslint-loader'
    }, {
      test: /\.tsx?$/,
      use: ['ts-loader'],
    }, {
      test: /\.css$/,
      use: ['style-loader', 'css-loader']
    }],
  },
  node: {
    fs: 'empty',
    child_process: 'empty',
    net: 'empty',
    module: 'empty'
  },
  plugins: [
    new CopyWebpackPlugin([
      { from: 'public' }
    ])
  ]
};
