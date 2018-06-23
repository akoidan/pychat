const path = require('path');
const VueLoaderPlugin = require('vue-loader/lib/plugin');
const HtmlWebpackPlugin = require("html-webpack-plugin");
const chalk = require('chalk');

module.exports = (env, argv) => {

  let plugins;
  let sasscPlugins;
  plugins = [
    new VueLoaderPlugin(),
    new HtmlWebpackPlugin({hash: true, favicon: 'src/assets/img/favicon.ico',  template: 'src/index.ejs', inject: false}),
  ];
  if (argv.mode === 'production') {
    const MiniCssExtractPlugin = require("mini-css-extract-plugin");
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
          test: /\.(woff2?|eot|ttf|otf|gif)(\?.*)?$/,
          loader: 'file-loader',
          options: {
            name: '[name].[ext]?[sha512:hash:base64:6]',
          }
        },
        {
          test: /\.(png|jpg|svg)$/,
          loader: 'url-loader',
          options: {
            limit: 32000
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
