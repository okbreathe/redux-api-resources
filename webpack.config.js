const path = require('path')
const dtsPlugin = require('dts-webpack-plugin');

module.exports = {
  entry: "./src/index.ts",
  output: {
    path: path.resolve('./dist'),
    filename: 'index.js'
  },
  plugins: [
    new dtsPlugin({
      name: 'redux-api-resources'
    })
  ],
  resolve: {
    extensions: [".ts", ".tsx", ".js", ".json", ".jsx"],
  },
  module: {
    loaders: [
      { test: /\.tsx?$/, loader: "ts-loader" }
    ]
  }
}
