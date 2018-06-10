const path = require('path');
const VueLoaderPlugin = require('vue-loader/lib/plugin');
const MiniCssExtractPlugin = require("mini-css-extract-plugin");
const HtmlWebpackPlugin = require("html-webpack-plugin");
const chalk = require('chalk');

module.exports = (env, argv) => {

  const conf =  {
    entry: ['./src/main.ts', './src/assets/sass/common.sass'],
    plugins: [
      new VueLoaderPlugin(),
      new MiniCssExtractPlugin(), // extract css to a separate file, instead of having it loaded from js
      // thus we can increase load time, since css is not required for domready state
      new HtmlWebpackPlugin({hash: true, favicon: 'src/assets/img/favicon.ico',  template: 'src/index.html'}),
    ],
    resolve: {
      extensions: ['.ts', '.js', '.vue', '.json'],
    },
    module: {
      rules: [
        {
          test: /\.ts$/,
          loader: 'ts-loader',
          exclude: /node_modules/,
          options: {
            appendTsSuffixTo: [/\.vue$/]
          }
        },
        {
          exclude: /node_modules/,
          test: /\.vue$/,
          loader: 'vue-loader',
        },
        {
          test: /\.sass$/,
          use: [
            MiniCssExtractPlugin.loader,
            "css-loader",
            "sass-loader?indentedSyntax"
          ]
        },
        {
          test: /\.(woff2?|eot|ttf|otf|svg)(\?.*)?$/,
          loader: 'file-loader',
          options: {
            name: '[name].[ext]?[sha512:hash:base64:6]',
          }
        },
        {
          test: /\.(png|jpg|gif)$/,
          loader: 'url-loader',
          options: {
            limit: 32000
          }
        },
      ],
    },
  };

  // if (argv.mode === 'development') {
    // create vendor.js file for development so webpack doesn't need to reassemble it every time
    // you can remove `argv.mode === 'development'` if you want it for prod. Or remove this if at all
    // conf.optimization = {
    //   splitChunks: {
    //     chunks: 'all',
    //     minSize: 0,
    //     maxAsyncRequests: Infinity,
    //     maxInitialRequests: Infinity,
    //     name: true,
    //     cacheGroups: {
    //       vendor: {
    //         name: 'vendor',
    //         chunks: 'initial',
    //         reuseExistingChunk: true,
    //         priority: -5,
    //         enforce: true,
    //         test: /[\\/]node_modules[\\/]/ // this also creates single css
    //       },
    //     }
    //   }
    // };
    // conf.devtool = '#source-map';
  // }
  return conf;
};
