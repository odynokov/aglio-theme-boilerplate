const path = require('path');
const webpack = require('webpack');
const HtmlWebpackPlugin = require('html-webpack-plugin');

function getJSON() {
  try {
    return require('./example.json')
  } catch (err) {
    console.log(err)
    return {}
  }
}

module.exports = {
  entry: {
    script: path.join(__dirname, 'scripts', 'index.js'),
    style: path.join(__dirname, 'styles', 'index.css')
  },

  output: {
    path: path.join(__dirname, 'build'),
    publicPath: '/',
    filename: '[name].js'
  },

  module: {
    rules: [
      {
        test: /\.js$/,
        use: ['babel-loader'],
        exclude: /node_modules/
      },
      {
        test: /\.css$/,
        use: [
          'style-loader',
          'css-loader',
          {
            loader: 'postcss-loader',
            options: {
              sourceMap: 'inline'
            }
          }
        ],
        exclude: /node_modules/
      },
      {
        test: /\.pug$/,
        loader: 'pug-loader',
        exclude: /node_modules/
      }
    ]
  },

  plugins: [
    new HtmlWebpackPlugin({
      template: path.join(__dirname, 'templates', 'index.pug'),
      filename: 'index.html'
    }),
    new webpack.DefinePlugin({data: JSON.stringify(getJSON())})
  ]
};
