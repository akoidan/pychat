const path = require('path');
const VueLoaderPlugin = require('vue-loader/lib/plugin');
const HtmlWebpackPlugin = require("html-webpack-plugin");
const chalk = require('chalk');
const webpack = require('webpack');
const CopyWebpackPlugin = require('copy-webpack-plugin');
const CleanWebpackPlugin = require('clean-webpack-plugin');
const SpeedMeasurePlugin = require("speed-measure-webpack-plugin");
const name = '[name].[ext]?[sha512:hash:base64:6]';

module.exports = (env, argv) => {
  let plugins;
  let sasscPlugins;
  if (!argv.mode) {
    throw `Pass --mode production/development, current ${argv.mode} is invalid`
  }
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
      {from: './src/assets/flags', to: 'flags'},
      // {from: './src/assets/static', to: ''},
    ]),
    new webpack.DefinePlugin({
      PYCHAT_CONSTS: JSON.stringify(options),
    }),
    new HtmlWebpackPlugin(webpackOptions),
  ];
  let devServer;
  if (argv.mode === 'production') {
    const MiniCssExtractPlugin = require("mini-css-extract-plugin");
    plugins.push(new CleanWebpackPlugin({cleanOnceBeforeBuildPatterns : ['./dist']}));
    plugins.push(new MiniCssExtractPlugin());
    let minicssPlugin = {
      loader: MiniCssExtractPlugin.loader,
    };
    if (options.PUBLIC_PATH) {
      minicssPlugin.options = {
        publicPath: `${options.PUBLIC_PATH}${path}`
      }
    }
    sasscPlugins = [
      minicssPlugin,
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
    var openInEditor = require('launch-editor-middleware');
    devServer =  {
      allowedHosts: [
        'pychat.org'
      ],
      before (app) {
        app.use('/__open-in-editor', openInEditor())
      }
    };
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
  }

  function getOptions(path, additionalArgs = {}) {
    let res = Object.assign({
      outputPath: path,
      name
    }, additionalArgs);
    if (options.PUBLIC_PATH) {
      res.publicPath = `${options.PUBLIC_PATH}${path}`;
    }
    return res;
  }

  const smp = new SpeedMeasurePlugin();
  const conf =  smp.wrap({
    devServer,
    entry: ['./src/main.ts'],
    plugins,
    resolve: {
      extensions: ['.ts', '.js', '.vue', '.json'],
      alias: {
        'vue': 'vue/dist/vue.js',
        '~': path.resolve(__dirname, 'src'),
        'Sass': path.resolve(__dirname, 'src/assets/sass')
      }
    },
    output: {
      publicPath: options.PUBLIC_PATH || '/' //https://github.com/webpack/webpack-dev-server/issues/851#issuecomment-399227814
    },
    optimization: { minimize: false},
    devtool: '#source-map',
    module: {
      rules: [
        {
          test: /sw\.ts$/,
          exclude: /node_modules/,
          loader: 'sw-loader',
          options: {
            publicPath: '/'
          }
        },
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
          options: getOptions('font')
        },
        {
          test: /favicon\.ico$/,
          loader: 'file-loader',
          options: getOptions('')
        },
        {
          test: /\.(mp3|wav)$/,
          loader: 'file-loader',
          options: getOptions('sounds')
        },
        {
          test: /\.(png|jpg|svg)$/,
          loader: 'url-loader',
          options: getOptions('img', {
            limit: 32000,
            fallback: "file-loader"
          })
        }
      ],
    },
  });

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
  console.log(JSON.stringify(conf, null, 2));
  return conf;
};
