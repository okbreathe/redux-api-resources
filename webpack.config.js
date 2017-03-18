const webpack = require('webpack')

const config = {
  entry: './src/index',
  module: {
    rules: [
      {
        test: /\.js$/,
        use: [ 'babel-loader' ],
        exclude: /node_modules/
      }
    ]
  },
  output: {
    library: 'ReduxResources',
    libraryTarget: 'umd'
  }
}

if (process.env.NODE_ENV === 'production') {
  config.plugins = [
    new webpack.optimize.UglifyJsPlugin({ sourceMap: true }),
    new webpack.LoaderOptionsPlugin({ minimize: true })
  ]
}

module.exports = config
