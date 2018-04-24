var path = require('path')
var webpack = require('webpack')

const CleanWebpackPlugin = require('clean-webpack-plugin');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const UglifyJSPlugin = require('uglifyjs-webpack-plugin');
const { TsConfigPathsPlugin } = require('awesome-typescript-loader');

module.exports = {
  entry: {
    fetch: 'whatwg-fetch',
    js: [
      // 'jsoneditor',
      'url-search-params-polyfill'
    ],
    // css: [
    //   'jsoneditor/dist/jsoneditor.css',
    // ],
    main: path.resolve(__dirname, '..', 'public/main.ts'),
  },
  output: {
    path: path.resolve(__dirname, '../dist/public'),
    filename: '[name].bundle.js',
  },
  module: {
    rules: [
      /** [vue js settings] */
      {
        test: /\.vue$/,
        loader: 'vue-loader',
        options: {
          loaders: {
            ts: 'ts-loader',
            tsx: 'babel-loader!ts-loader',
          }
        }
      }, {
        test: /\.ts?$/,
        loader: 'ts-loader',
        exclude: /node_modules/,
        options: {
          appendTsSuffixTo: [/\.vue$/],
        }
      }, {
        test: /\.tsx$/,
        loader: 'babel-loader!ts-loader',
        options: {
          appendTsxSuffixTo: [/TSX\.vue$/],
          compilerOptions: {
            declaration: false,
          }
        }
      }, {
        test: /\.css$/,
        use: [
          'style-loader',
          'css-loader'
        ]
      },
      {
        test: /\.(png|jpg|gif)$/,
        use: [
          'file-loader'
        ],
      },
      {
        test: /\.(otf|eot|svg|ttf|woff|woff2|svg)(\?.+)?$/,
        loader: 'url-loader'
      },
    ]
  },
  plugins: [
    new CleanWebpackPlugin(['dist/public'], {
      root: path.resolve(__dirname, '..'),
    }),
    new HtmlWebpackPlugin({
      inject: true,
      template: `./public/index.html`,
    })
  ],
  resolve: {
    extensions: ['.ts', '.js', '.vue', '.html'],
    alias: {
      'vue$': 'vue/dist/vue.esm.js'
    },
    plugins: [
      new TsConfigPathsPlugin({
        tsconfig: path.resolve(__dirname, '..', 'public/tsconfig.public.json')
      })
    ]
  },
  performance: {
    hints: false
  },
  devtool: '#eval-source-map'
}

if (process.env.NODE_ENV === 'production') {
  module.exports.devtool = '#source-map'
  // http://vue-loader.vuejs.org/en/workflow/production.html
  module.exports.plugins = (module.exports.plugins || []).concat([
    new webpack.DefinePlugin({
      'process.env': {
        NODE_ENV: '"production"'
      }
    }),
    new webpack.optimize.UglifyJsPlugin({
      sourceMap: false,
      compress: {
        warnings: false
      }
    }),
    new webpack.LoaderOptionsPlugin({
      minimize: true
    })
  ])
}