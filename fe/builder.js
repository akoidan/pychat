#!/usr/bin/env node

'use strict';

/* eslint-disable no-shadow, no-console */


const WebpackDevServer = require('webpack-dev-server');
const fs = require('fs');
const path = require('path');
const VueLoaderPlugin = require('vue-loader/lib/plugin');
const HtmlWebpackPlugin = require("html-webpack-plugin");
const webpack = require('webpack');
const CopyWebpackPlugin = require('copy-webpack-plugin');
const name = '[name].[ext]?[sha512:hash:base64:6]';
const child_process = require('child_process');
const ELECTRON_DIST_DIRNAME = 'electron_dist';
const MAIN_DIST_DIRNAME = 'dist';
const ANDROID_DIST_DIRNAME = 'www';
const ELECTRON_DIST = path.resolve(__dirname, ELECTRON_DIST_DIRNAME);
const MAIN_DIST = path.resolve(__dirname, MAIN_DIST_DIRNAME);
const ANDROID_DIST = path.resolve(__dirname, ANDROID_DIST_DIRNAME);
const DEV_PORT = 8080;

function getDist() {
  if (options.IS_WEB) {
    return MAIN_DIST;
  } else if (options.IS_ELECTRON) {
    return ELECTRON_DIST;
  } else if (options.IS_ANDROID) {
    return ANDROID_DIST;
  } else {
    throw Error("unknown mode");
  }
}

class SaveHtmlToFile {

  constructor(filename) {
    this.filename = filename;
  }
  apply(compiler) {
    compiler.hooks.compilation.tap('SaveHtmlToFile', (compilation) => {
      HtmlWebpackPlugin.getHooks(compilation).beforeEmit.tapAsync(
        'SaveHtmlToFile',
        (data, cb) => {
          // Manipulate the content
          fs.writeFile(this.filename, data.html, function(err) {
            if(err) {
              throw err;
            }
            cb();
          });
        }
      )
    })
  }
}


const {options, definePlugin, optimization, configFile, startCordova} = function () {
  function getEnv(mode, trueValue, falseValues) {
    if (process.env[mode] === trueValue) {
      return true;
    } else if (falseValues.includes(process.env[mode])) {
      return false;
    } else {
      throw Error(`env ${mode} is not defined`);
    }
  }
  const startCordova = process.argv[2];

  const isProd = getEnv('BUILD_MODE', 'production', ['development']);
  // cordova is built for production atm
  let options = require(isProd && !startCordova ? `./production.json` : './development.json');
  options.IS_PROD = isProd;
  options.IS_ELECTRON = getEnv('PLATFORM', 'electron', ['web', 'android']);
  options.IS_ANDROID = getEnv('PLATFORM', 'android', ['electron', 'web']);
  options.IS_WEB = getEnv('PLATFORM', 'web', ['electron', 'android']);
  options.SERVICE_WORKER_URL = options.IS_WEB ? '/sw.js' : false;

  if (options.IS_ANDROID)  {
    if (startCordova) {
      options.BACKEND_ADDRESS = `${startCordova}:${options.BACKEND_ADDRESS.split(':')[1]}`;
    } else {
      console.error(`To start emulation use \nnpm run android 192.168.1.17\n where AVD is in bridge mode and 17 is your IP`);
    }
  }
  if (options.IS_ELECTRON || options.IS_ANDROID) {
    ["GOOGLE_OAUTH_2_CLIENT_ID", "FACEBOOK_APP_ID", "RECAPTCHA_PUBLIC_KEY"].forEach((v) => {
      if (options[v]) {
        console.error(`${v}=${options[v]} is not implemented yet, the value would be ignored`);
        options[v] = false;
      }
    });
  }
  let gitHash;
  try {
    gitHash = child_process.execSync('git rev-parse --short=10 HEAD', {encoding: 'utf8'});
    gitHash = gitHash.trim();
    options.GIT_HASH = gitHash;
    console.log(`Git hash = ${gitHash}`)
  } catch (e) {
    console.error("Git hash is unavailable");
  }
  options.IS_SSL = true;
  if (options.IS_ELECTRON || options.IS_ANDROID) {
    if (isProd) {
      options.PUBLIC_PATH = './'
    } else {
      options.PUBLIC_PATH = `https://localhost:${DEV_PORT}/`
    }
  }

  options.ELECTRON_MAIN_FILE = options.IS_PROD ? `file://{}/index.html` : `file:///tmp/electron.html`;
  const optimization = options.IS_WEB && !options.IS_DEBUG ? {
    minimize: true,
    usedExports: true,
    sideEffects: true
  } : {
    minimize: false,
    usedExports: true,
    sideEffects: true
  };

  const configFile = options.IS_WEB && !options.IS_DEBUG ? 'tsconfig.json' : 'tsconfig.esnext.json' ;
  let definePlugin = new webpack.DefinePlugin({PYCHAT_CONSTS: JSON.stringify(options)});
  return {options, definePlugin, optimization, configFile, startCordova};
}();




const getConfig = async () => {
  let plugins;
  let sasscPlugins;

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


  let webpackOptions = {
    hash: true,
    favicon: 'src/assets/img/favicon.ico',
    template: 'src/index.ejs',
    inject: false
  };
  if (options.MANIFEST && options.IS_WEB) {
    webpackOptions.manifest = options.MANIFEST
  }

  let htmlWebpackPlugin = new HtmlWebpackPlugin(webpackOptions);

  plugins = [
    definePlugin,
    new VueLoaderPlugin(),
    new CopyWebpackPlugin([
      {from: './src/assets/smileys', to: 'smileys'},
      {from: './src/assets/manifest.json', to: ''},
      {from: './src/assets/flags', to: 'flags'},
    ]),
    htmlWebpackPlugin,
  ];
  if (!options.IS_PROD && options.IS_ELECTRON) {
    plugins.push(new SaveHtmlToFile('/tmp/electron.html'));
  }
  if (options.IS_PROD) {
    const MiniCssExtractPlugin = require("mini-css-extract-plugin");
    const CleanWebpackPlugin = require('clean-webpack-plugin');
    if (options.IS_WEB) {
      const CompressionPlugin = require('compression-webpack-plugin');
      plugins.push(new CompressionPlugin())
    }
    plugins.push(new CleanWebpackPlugin({cleanOnceBeforeBuildPatterns: getDist()}));
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
  } else {
    // TODO it lags a lot
    // const HardSourceWebpackPlugin = require('hard-source-webpack-plugin');
    // plugins.push(new HardSourceWebpackPlugin({
    //   environmentHash: {
    //     root: process.cwd(),
    //     includePaths: [path.resolve(__dirname, 'src/assets/sass')],
    //     directories: [],
    //     files: ['package.json', `jsonConfig.json`],
    //   }
    // }))
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

  let conf = {
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
    mode: options.IS_PROD ? 'production' : 'development',
    output: {
      path: getDist(),
      publicPath: options.PUBLIC_PATH || '/' //https://github.com/webpack/webpack-dev-server/issues/851#issuecomment-399227814
    },
    optimization,
    devtool: '#source-map',
    module: {
      rules: [
        {
          test: /\.ts$/,
          loader: 'ts-loader',
          exclude: /node_modules/,
          options: {
            configFile,
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
  };


  // if (options.IS_PROD) {
  //   const SpeedMeasurePlugin = require("speed-measure-webpack-plugin");
  //   const spm = new SpeedMeasurePlugin();
  //   conf = spm.wrap(conf);
  // }

  return conf;

};


const getSimpleConfig = async (mainFile, dist, entry, target) => {
  return {
    entry,
    target,
    resolve: {
      extensions: ['.ts', '.js', '.json']
    },
    watch: !options.IS_PROD,
    mode: options.IS_PROD ? 'production' : 'development',
    output: {
      path: dist,
      filename: mainFile
    },
    optimization,
    module: {
      rules: [
        {
          test: /\.ts$/,
          loader: 'ts-loader',
          options: {configFile}
        }
      ]
    },
    plugins: [
      definePlugin
    ],
    devtool: '#source-map'
  };
};

async function runElectron(mainPath) {
  return new Promise((resolve, reject) => {
    const electron = require('electron'); // electron path
    const proc = require('child_process');

    const child = proc.spawn(electron, [mainPath], {
      windowsHide: false,
      stdio: 'inherit',
    });

    child.on('close', (code, signal) => {
      console.log('Electron finished', signal);
      reject(code)
    });

    ['SIGINT', 'SIGTERM'].forEach(signal => {
      process.on(signal, () => {
        if (!child.killed) {
          child.kill(signal)
        }
      });
    });
  });
}


async function setup() {

  let config = await getConfig();

  if (options.IS_PROD) {
    const webpack = require('webpack');
    let stats = await new Promise((resolve, reject) => {
      webpack(config, (err, stats) => {
        if (err) {
          reject(err);
        }
        resolve(stats);
      })
    });
    console.log(stats.toString({
      chunks: false,  // Makes the build much quieter
      colors: true    // Shows colors in the console
    }));


  } else {
    let [key, cert, ca] = await Promise.all(
      ['key.pem', 'server.crt', 'csr.pem'].map(e => new Promise(
        resolve => fs.readFile(path.resolve(__dirname, 'certs', e), (err, data) => resolve(data))
      ))
    );

    let devServer = {
      disableHostCheck: true,
      headers: {
        'Access-Control-Allow-Origin': '*'
      },
      public: `https://localhost:${DEV_PORT}`,
      historyApiFallback: true,
      inline: true,
      host: '0.0.0.0',
      port: DEV_PORT,
      http2: options.IS_SSL,
      hot: true,
      https: options.IS_SSL ? {key, cert, ca} : false,
      before(app) {
        app.use('/__open-in-editor', require('launch-editor-middleware')())
      }
    };

    let server = new WebpackDevServer(webpack(config), devServer);
    server.listen(devServer.port, devServer.host, function (err) {
      if (err) {
        throw err;
      }
    });

    ['SIGINT', 'SIGTERM'].forEach(signal => {
      process.on(signal, () => {
        server.close()
      });
    });

  }
  let processSingleFile = async function (electronConfig) {
    let stats = await new Promise((resolve, reject) => {
      webpack(electronConfig, (err, stats) => {
        if (err) {
          reject(err)
        } else {
          resolve(stats)
        }
      })
    });
    console.log(stats.toString({
      chunks: false,  // Makes the build much quieter
      colors: true    // Shows colors in the console
    }));
  };
  if (options.IS_ELECTRON) {
    let config = await getSimpleConfig(
      'electron.js',
      options.IS_PROD ? getDist() : '/tmp/',
      ['./src/electron.ts'],
      'electron-main',
    );
    await processSingleFile(config);
    if (!options.IS_PROD) {
      await runElectron(`/tmp/electron.js`);
    }
  } else if(startCordova) {
    require('loud-rejection/register');
    const util = require('util');
    const { events, CordovaError } = require('cordova-common');
    const cli = require('cordova/src/cli');

    await cli([null, null, 'run']);

  } else if (options.IS_WEB) {
    let config = await getSimpleConfig(
      'sw.js',
      options.IS_PROD ? getDist() : '/tmp/',
      ['./src/sw.ts']
    );
    await processSingleFile(config);
  }
}

setup().catch(e => {
  throw e
});
