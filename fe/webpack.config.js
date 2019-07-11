const path = require('path');
const VueLoaderPlugin = require('vue-loader/lib/plugin');
const HtmlWebpackPlugin = require("html-webpack-plugin");
const webpack = require('webpack');
const CopyWebpackPlugin = require('copy-webpack-plugin');
const name = '[name].[ext]?[sha512:hash:base64:6]';
const child_process = require('child_process');

module.exports = (env, argv) => {
  let plugins;
  let sasscPlugins;
  let isProd = argv.mode === 'production';
  let isDev = argv.mode === 'development';
  if (!isProd && !isDev) {
    throw `Pass --mode production/development, current ${argv.mode} is invalid`
  }
  let options = require(`./${argv.mode}.json`);
  let gitHash;
  try {
    gitHash = child_process.execSync('git rev-parse --short=10 HEAD', {encoding: 'utf8'});
    gitHash = gitHash.trim();
    options.GIT_HASH = gitHash;
    console.log(`Git hash = ${gitHash}`)
  } catch (e) {
    console.error("Git hash is unavailable");
  }
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
    ]),
    new webpack.DefinePlugin({
      PYCHAT_CONSTS: JSON.stringify(options),
    }),
    new HtmlWebpackPlugin(webpackOptions),
  ];
  let devServer;
  if (isProd) {
    const MiniCssExtractPlugin = require("mini-css-extract-plugin");
    const CleanWebpackPlugin = require('clean-webpack-plugin');
    const CompressionPlugin = require('compression-webpack-plugin');
    plugins.push(new CompressionPlugin())
    plugins.push(new CleanWebpackPlugin({cleanOnceBeforeBuildPatterns : ['./dist']}));
    plugins.push(new MiniCssExtractPlugin());
    let minicssPlugin = {
      loader: MiniCssExtractPlugin.loader,
    };
    if (options.PUBLIC_PATH) {
      minicssPlugin.options = {
        publicPath: options.PUBLIC_PATH
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
  } else if (isDev) {
    var openInEditor = require('launch-editor-middleware');
    const HardSourceWebpackPlugin = require('hard-source-webpack-plugin');
    plugins.push(new HardSourceWebpackPlugin({
      environmentHash: {
        root: process.cwd(),
        directories: [],
        files: ['package.json', `${argv.mode}.json`],
      }
    }))
    devServer = {
      allowedHosts: [
        'pychat.org',
        'vue.pychat.org',
        "mycoolsite.org"
      ],
      before(app) {
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

  let conf = {
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
          test: /((fonts?\/.*\.svg)|(\.(woff2?|eot|ttf|otf)))(\?.*)?$/,
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
          test: /assets\/img\/.*\.(png|jpg|svg)$/,
          loader: 'url-loader',
          options: getOptions('img', {
            limit: 32000,
            fallback: "file-loader"
          })
        }
      ],
    },
  }
  if (isProd) {
    const SpeedMeasurePlugin = require("speed-measure-webpack-plugin");
    const spm = new SpeedMeasurePlugin();
    conf = spm.wrap(conf);
  }

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
