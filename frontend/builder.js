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
const StyleLintPlugin = require('stylelint-webpack-plugin');
const sassOptionsGlobal = {
  loader: "sass-loader",
  options: {
    sassOptions: {
      indentedSyntax: true,
      includePaths: [path.resolve(__dirname, 'src/assets/sass')]
    }
  }
}

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


const {options, definePlugin, optimization, configFile, startCordova, linting} = function () {
  function getEnv(mode, trueValue, falseValues) {
    if (process.env[mode] === trueValue) {
      return true;
    } else if (!falseValues || falseValues.includes(process.env[mode])) {
      return false;
    } else {
      throw Error(`env ${mode} is not defined`);
    }
  }
  const startCordova = process.argv[2];

  const linting = process.env.LINTING  === 'on';
  const isProd = getEnv('BUILD_MODE', 'production', ['development']);
  // cordova is built for production atm
  let options = require(isProd && !startCordova ? `./production.json` : './development.json');
  options.IS_PROD = isProd;
  options.IS_ELECTRON = getEnv('PLATFORM', 'electron', ['web', 'android']);
  options.IS_ANDROID = getEnv('PLATFORM', 'android', ['electron', 'web']);
  options.IS_WEB = getEnv('PLATFORM', 'web', ['electron', 'android']);
  options.SERVICE_WORKER_URL = options.IS_WEB ? '/sw.js' : false;
  options.IS_PROFILE = getEnv('PROFILE', 'true');
  if (options.IS_ANDROID)  {
    if (startCordova) {
      options.BACKEND_ADDRESS = `${startCordova}:${options.BACKEND_ADDRESS.split(':')[1]}`;
    } else {
      console.error(`To start emulation use \nnpm run android 192.168.1.17\n where AVD is in bridge mode and 17 is your IP`);
    }
  }
  if (options.IS_ELECTRON || options.IS_ANDROID) {
    // oauth doesn't work from file:// protocol
    // we need to load the http page for registration where they are used
    // temporary stabbing them as null
    ["GOOGLE_OAUTH_2_CLIENT_ID", "FACEBOOK_APP_ID"].forEach((v) => {
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
    if (isProd && !startCordova) {
      // before we reassigned PUBLIC_PATH
      if (options.PUBLIC_PATH) {
        options.CAPTCHA_IFRAME = `${options.PUBLIC_PATH}/recaptcha.html`;
      } else {
        options.CAPTCHA_IFRAME = `${options.IS_SSL? 'https': 'http'}://${options.BACKEND_ADDRESS}/recaptcha.html`;
      }
      options.PUBLIC_PATH = './'
    } else {
      options.PUBLIC_PATH = `https://localhost:${DEV_PORT}/`;
      options.CAPTCHA_IFRAME = `${options.PUBLIC_PATH}/recaptcha.html`;
    }
  }

  options.ELECTRON_MAIN_FILE = options.IS_PROD ? `file://{}/index.html` : `file:///tmp/electron.html`;
  const optimization = options.IS_WEB && options.UGLIFY ? {
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
  return {options, definePlugin, optimization, configFile, startCordova, linting};
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
  const entry = ['reflect-metadata', './src/main.ts'];


  let webpackOptions = {
    hash: true,
    favicon: 'src/assets/img/favicon.ico',
    template: 'src/index.ejs',
    inject: false
  };
  if (options.MANIFEST && options.IS_WEB) {
    webpackOptions.manifest = options.MANIFEST
  }

  if (options.UGLIFY || !options.IS_DEBUG) { // uglyging this is not that important as reducing file that's always refreshing
    webpackOptions.minify = {
      collapseWhitespace: true,
      removeComments: true,
      removeRedundantAttributes: true,
      removeScriptTypeAttributes: true,
      removeStyleLinkTypeAttributes: true,
      useShortDoctype: true
    };
  }

  let htmlWebpackPlugin = new HtmlWebpackPlugin(webpackOptions);

  plugins = [
    definePlugin,
    new VueLoaderPlugin(),
    new CopyWebpackPlugin([
      {from: './src/assets/manifest.json', to: ''},
      {from: './src/assets/recaptcha.html', to: ''},
    ]),
    htmlWebpackPlugin,
  ];
  if (linting) {
    plugins.unshift(new StyleLintPlugin({
      files: ['**/*.vue', '**/*.sass'],
      failOnError: false,
    }))
  }
  if (!options.IS_PROD && options.IS_ELECTRON) {
    plugins.push(new SaveHtmlToFile('/tmp/electron.html'));
  }
  if (!options.IS_DEBUG && options.IS_WEB) {
    entry.unshift('./src/polyfills/inputEvent.ts')
  }
  if (options.IS_PROD) {
    const SriPlugin = require('webpack-subresource-integrity');
    plugins.push(new SriPlugin({
      hashFuncNames: ['sha256', 'sha384'],
      enabled: true,
    }));
    const MiniCssExtractPlugin = require("mini-css-extract-plugin");
    const {CleanWebpackPlugin} = require('clean-webpack-plugin');
    if (options.IS_WEB) {
      const CompressionPlugin = require('compression-webpack-plugin');
      plugins.push(new CompressionPlugin())
    }
    if (options.IS_WEB && options.UGLIFY) {
      const OptimizeCSSAssetsPlugin = require("optimize-css-assets-webpack-plugin");
      plugins.push(new OptimizeCSSAssetsPlugin({
        cssProcessorOptions: {
          map: {
            inline: false
          }
        }
      }));
    }
    plugins.push(new CleanWebpackPlugin({cleanOnceBeforeBuildPatterns: getDist()}));
    plugins.push(new MiniCssExtractPlugin());
    plugins.push(new webpack.ProgressPlugin(function (percentage, msg, current, active, modulepath) {
        if (process.stdout.isTTY && percentage < 1) {
          process.stdout.cursorTo(0);
          modulepath = modulepath ? ' …' + modulepath.substr(modulepath.length - process.stdout.columns + 45) : '';
          current = current ? ' ' + current : '';
          active = active ? ' ' + active : '';
          process.stdout.write((percentage * 100).toFixed(0) + '% ' + msg + current + active + modulepath + ' ')
          process.stdout.clearLine(1)
        } else if (percentage === 1) {
          process.stdout.write('\n');
          console.log('webpack: done.')
        }
      })
    );
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
      sassOptionsGlobal,
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
      sassOptionsGlobal
    ];
  }

  let tsConfig = function () {
    const res =  [
      {
        loader: 'ts-loader',
        options: {
          configFile,
          appendTsSuffixTo: [/\.vue$/]
        }
      },
    ];
    if (linting) {
      res.push({
        loader: 'tslint-loader'
      })
    }
    return res;
  };
  let conf = {
    entry,
    plugins,
    profile: !!options.IS_PROFILE,
    resolve: {
      extensions: ['.ts', '.js', '.vue'],
      alias: {
        'vue': 'vue/dist/vue.js',
        '@': path.resolve(__dirname, 'src')
      }
    },
    mode: options.IS_PROD ? 'production' : 'development',
    output: {
      crossOriginLoading: 'anonymous',
      path: getDist(),
      publicPath: options.PUBLIC_PATH || '/' //https://github.com/webpack/webpack-dev-server/issues/851#issuecomment-399227814
    },
    optimization,
    devtool: '#source-map',
    module: {
      rules: [
        {
          test: /\.ts$/,
          exclude: /node_modules/,
          use: tsConfig(),
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
          test: /assets\/flags\/.*\.png$/,
          loader: options.FLAGS ? 'file-loader': 'null-loader',
          options: getOptions('flags')
        },
        {
          test: /assets\/smileys\/.*\.gif$/,
          loader: 'file-loader',
          options: getOptions('smileys')
        },
        {
          test: /assets\/img\/.*\.(png|jpg|svg|gif)$/,
          loader: 'file-loader',
          options: getOptions('img')
        }
        // FUCK url loader, http2 works competely fine,
        // we get rid of bugs like https://data:image
        // we don't need to increase file size of main.js that loads CPU
        // we don't need that nor for electron/cordova
        // {
        //   test: /assets\/img\/.*\.(png|jpg|svg|gif)$/,
        //   loader: 'url-loader',
        //   options: getOptions('img', {
        //     limit: options.IS_ANDROID || options.IS_ELECTRON ? 1: 32000,
        //     fallback: "file-loader"
        //   })
        // }
      ],
    },
  };
  if (linting) {
    conf.module.rules.push({
      enforce: 'pre',
        test: /\.vue$/,
      loader: 'eslint-loader',
      exclude: /node_modules/
    });
  }

  // if (options.IS_PROD) {
  //   const SpeedMeasurePlugin = require("speed-measure-webpack-plugin");
  //   const spm = new SpeedMeasurePlugin();
  //   conf = spm.wrap(conf);
  // }

  return conf;

};


function getSimpleConfig(mainFile, dist, entry, target) {
  return {
    entry,
    target,
    resolve: {
      extensions: ['.ts', '.vue', '.json', ".js", '.png', ".sass"],
      alias: {
        '@': path.resolve(__dirname, 'src')
      },
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
}

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


function runWebpack(config) {
  return new Promise((resolve, reject) => {
    webpack(config, (err, stats) => {
      process.stdout.write('\x1Bc');
      console.log(stats.toString({
        chunks: false,  // Makes the build much quieter
        colors: true    // Shows colors in the console
      }));
      if (options.IS_PROFILE) {
        fs.writeFile("compilation-stats.json", JSON.stringify(stats.toJson(), null, 2), function(err) {
          if(err) {
            return console.log(err);
          }

          console.log("The file was saved!");
        });
      }
      console.log(Date.now());
      if (err) {
        reject(err);
      }
      if (stats.compilation.errors.length) {
        if (options.IS_PROD) {
          reject(stats.compilation.errors)
        }
      } else {
        resolve();
      }
    })
  });
}

async function setup() {

  let config = await getConfig();

  if (options.IS_PROD) {
    await runWebpack(config);
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

    let compiler = webpack(config);
    let server = new WebpackDevServer(compiler, devServer);
    let devapp = await new Promise((resolve, reject) => {
      server.listen(devServer.port, devServer.host, function (out, err) {
        if (err) {
          reject(err);
        } else {
          resolve(out);
        }
      });
    });

    ['SIGINT', 'SIGTERM'].forEach(signal => {
      process.on(signal, () => {
        server.close()
      });
    });

  }
  if (options.IS_ELECTRON) {
    let config = getSimpleConfig(
      'electron.js',
      options.IS_PROD ? getDist() : '/tmp/',
      ['./src/electron.ts'],
      'electron-main',
    );
    await runWebpack(config);
    if (options.IS_PROD) {

    } else {
      await runElectron(`/tmp/electron.js`);
    }
  } else if(startCordova) {
    require('loud-rejection/register');
    const cli = require('cordova/src/cli');
    await cli([null, null, 'run']);

  } else if (options.IS_WEB) {
    let config = getSimpleConfig(
      'sw.js',
      options.IS_PROD ? getDist() : '/tmp/',
      ['./src/sw.ts']
    );
    await runWebpack(config);
  }
}

setup().catch(e => {
  try {
    console.error(e);
  } finally {
    process.exit(1);
  }
});
