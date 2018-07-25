const path = require('path');
const CopyWebpackPlugin = require('copy-webpack-plugin');

const config = {
  entry: './src/index.tsx',
  mode: 'development',
  output: {
    path: path.resolve('build'),
    filename: 'js/[name].bundle.js'
  },
  resolve: {
    modules: ['./build', './src', 'node_modules'],
    extensions: ['.js', '.jsx', '.json', '.ts', '.tsx']
  },
  module: {
    rules: [
      {
        test: /\.tsx?$/,
        use: ['ts-loader'],
      },
      {
        test: /\.css$/,
        use: ['style-loader', 'css-loader']
      }
    ],
  },
  devtool: 'source-map',
  node: {
    'fs': 'empty',
    'child_process': 'empty',
    'net': 'empty',
    'module': 'empty'
  },
    plugins: [
        new CopyWebpackPlugin([
            { from: 'public' }
        ])
    ]
};

module.exports = config;