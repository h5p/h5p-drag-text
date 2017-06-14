const path = require('path');
const webpack = require('webpack');
const ExtractTextPlugin = require("extract-text-webpack-plugin");
const isProd = (process.env.NODE_ENV === 'production');

const extractCss = new ExtractTextPlugin({
  filename: "h5p-drag-text.css"
});

const config = {
  entry: "./src/entries/dist.js",
  devtool: isProd ? 'source-map' : 'inline-source-map',
  output: {
    path: path.join(__dirname, 'dist'),
    filename: "h5p-drag-text.js",
    sourceMapFilename: '[file].map'
  },
  module: {
    rules: [
      {
        test: /\.js$/,
        use: 'babel-loader'
      },
      {
        test: /\.css$/,
        use: extractCss.extract({
          use: [
            {
              loader: "css-loader"
            }
          ]
        })

      },
      {
        test: /\.(svg)$/,
        include: path.join(__dirname, 'src/images'),
        loader: 'url-loader?limit=10000'
      } // inline base64 URLs for <=10k images, direct URLs for the rest
    ]
  },

  plugins: [
    extractCss,
    new webpack.DefinePlugin({
      'process.env': {
        'NODE_ENV': JSON.stringify(process.env.NODE_ENV)
      }
    })
  ]
};

module.exports = config;
