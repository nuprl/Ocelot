const path = require('path');
const config = {
  entry: './build/dist/index.js',
  output: { 
    path: path.resolve('build'),
    filename: './ocelot.js' 
  },
  resolve: {
    modules: [ './build', './src', 'node_modules' ]
  },
  module: {
    rules: [
      {
        test: /\.css$/,
        use: [ 'style-loader', 'css-loader' ]
      }
    ],  
  },
  devtool: 'source-map',
  node: {
    'fs': 'empty',
    'child_process': 'empty',
    'net': 'empty',
    'module': 'empty'
  }
};

module.exports = config;