const path = require('path');;
const VueLoaderPlugin = require('vue-loader/lib/plugin');

let is_prod = process.env.NODE_ENV === 'production';
assetsPath = function (_path) {
  let assetsSubDirectory = is_prod ? '' : 'static';
  return path.posix.join(assetsSubDirectory, _path)
};


module.exports = {
  entry: './src/main.ts',
  output: {
    filename: 'main.js',
    publicPath: '/dist/',
    path: path.resolve(__dirname, 'dist')
  },
  plugins: [
    new VueLoaderPlugin()
  ],
  resolve: {
    extensions: ['.ts', '.js', '.vue', '.json'],
    alias: {
      'vue$': 'vue/dist/vue.esm.js'
    }
  },
  mode: 'development',
  devtool: '#source-map',
  devServer: {
    historyApiFallback: true,
    noInfo: true
  },
  // optimization: {
  //   splitChunks: {
  //     cacheGroups: {
  //       commons: {
  //         test: /[\\/]node_modules[\\/]/,
  //         name: "vendors",
  //         chunks: "all"
  //       }
  //     }
  //   },
  // },
  module: {
    rules: [
      // {
      //   test: /\.ts$/,
      //   exclude: /node_modules/,
      //   enforce: 'pre',
      //   loader: 'tslint-loader'
      // },
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
        options: {
          loaders: {
            // ts:  'ts-loader!tslint-loader'
            ts:  'ts-loader'
          }
        }
      },
      // {
      //   exclude: /node_modules/,
      //   test: /\.sass$/,
      //   use: [
      //     "css-loader", // translates CSS into CommonJS
      //     "sass-loader" // compiles Sass to CSS
      //   ]
      // },
      // {
      //   exclude: /node_modules/,
      //   test: /\.(woff2?|eot|ttf|otf)(\?.*)?$/,
      //   loader: 'url-loader',
      //   options: {
      //     limit: 10000000,
      //     name: assetsPath('fonts/[name].[ext]')
      //   }
      // }
    ],
  }
};
