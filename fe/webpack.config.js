const path = require('path');
const VueLoaderPlugin = require('vue-loader/lib/plugin');
const HtmlWebpackPlugin = require("html-webpack-plugin");
const chalk = require('chalk');
const webpack = require('webpack');
const CopyWebpackPlugin = require('copy-webpack-plugin');
const CleanWebpackPlugin = require('clean-webpack-plugin');

module.exports = (env, argv) => {
  let plugins;
  let sasscPlugins;
  let options = require(`./${argv.mode}.json`);
  let webpackOptions = {
    hash: true,
    favicon: 'src/assets/img/favicon.ico',
    template: 'src/index.ejs',
    inject: false
  };
  if (options.MANIFEST) {
    webpackOptions.manifest = options.MANIFEST
  }
  plugins = [
    new VueLoaderPlugin(),
    new CopyWebpackPlugin([
      {from: './src/assets/smileys', to: 'smileys'},
      {from: './src/assets/manifest.json', to: ''},
      {from: './src/assets/sw.js', to: ''},
    ]),
    new webpack.DefinePlugin({
      PYCHAT_CONSTS: JSON.stringify(options),
    }),
    new HtmlWebpackPlugin(webpackOptions),
  ];
  if (argv.mode === 'production') {
    const MiniCssExtractPlugin = require("mini-css-extract-plugin");
    plugins.push(new CleanWebpackPlugin('./dist'));
    plugins.push(new MiniCssExtractPlugin());
    sasscPlugins = [
      MiniCssExtractPlugin.loader,
      'css-loader',
      {
        loader: "sass-loader",
        options: {
          indentedSyntax: true,
          includePaths: [path.resolve(__dirname, 'src/assets/sass')]
        }
      }
    ];
  } else if (argv.mode === 'development') {
    sasscPlugins = [
      "style-loader", 'css-loader?sourceMap',
      {
        loader: "sass-loader",
        options: {
          indentedSyntax: true,
          includePaths: [path.resolve(__dirname, 'src/assets/sass')]
        }
      }
    ];
  } else {
    throw `Pass --mode production/development, current ${argv.mode} is invalid`
  }

  const conf =  {
    entry: ['./src/main.ts'],
    plugins,
    resolve: {
      extensions: ['.ts', '.js', '.vue', '.json'],
      alias: {
        vue: 'vue/dist/vue.js'
      }
    },
    output: {
      publicPath: '/' //https://github.com/webpack/webpack-dev-server/issues/851#issuecomment-399227814
    },
    devtool: '#source-map',
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
          use: sasscPlugins
        },
        {
          test: /\.(woff2?|eot|ttf|otf)(\?.*)?$/,
          loader: 'file-loader',
          options: {
            outputPath: 'font/',
            name: '[name].[ext]?[sha512:hash:base64:6]',
          }
        },
        {
          test: /^favicon.ico$/,
          loader: 'file-loader',
          options: {
            outputPath: '/',
            name: '[name].[ext]?[sha512:hash:base64:6]',
          }
        },
        {
          test: /\.(png|jpg|svg)$/,
          loader: 'url-loader',
          options: {
            limit: 32000,
            name: 'img/[name].[ext]?[sha512:hash:base64:6]'
          }
        },
      ],
    },
  };

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
    // conf.
  // }
  return conf;
};
