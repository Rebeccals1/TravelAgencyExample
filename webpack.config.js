const currentTask = process.env.npm_lifecycle_event;
const { Server } = require("http");
const path = require("path");
const { CleanWebpackPlugin } = require('clean-webpack-plugin');
const MiniCssExtractPlugin = require("mini-css-extract-plugin");
const cssMinimizerPlugin = require("css-minimizer-webpack-plugin");
const HtmlWebpackPlugin = require('html-webpack-plugin');
const fse = require('fs-extra');

const postCSSPlugins = [
  require('postcss-import'),
  require('postcss-mixins'),
  require("postcss-simple-vars"), 
  require("postcss-nested"), 
  require("autoprefixer")
]

class RunAfterCompile {
  apply(compiler) {
    compiler.hooks.done.tap('Copy Images', function(){
      fse.copySync('./app/assets/images', './docs/assets/images')
    })
  }
}

let cssConfig = {
  test: /\.css$/i,
  use: [ 
    "css-loader?url=false", 
    {loader: "postcss-loader", options: {postcssOptions: {plugins: postCSSPlugins}}}
  ]
}

let pages = fse.readdirSync('./app').filter(function(file){
  return file.endsWith('.html')
}).map(function(page){
  return new HtmlWebpackPlugin({
    filename: page,
    template: `./app/${page}`
  })
})

let config = {
  entry: "./app/assets/scripts/App.js",
  plugins: pages,
  module: {
    rules: [cssConfig]
  }
}

if (currentTask == 'serve') {
  cssConfig.use.unshift('style-loader')
  config.output = {
    filename: "bundled.js",
    path: path.resolve(__dirname, "app"),
  }
  config.devServer = {
    static: {
        directory: path.join(__dirname, 'app'),
    },
    hot: true,
    compress: true,
    port: 8080,
  }
  config.mode = "development"
}

if(currentTask == 'build') {
  config.module.rules.push({
    test: /\.js$/,
    exclude: /(node_modules)/,
    use: {
      loader: "babel-loader",
      options: {
        presets: ['@babel/preset-env']
      }
    }
  })

  cssConfig.use.unshift(MiniCssExtractPlugin.loader)
  config.output = {
    filename: "[name].[hash:8].js",
    path: path.resolve(__dirname, "docs"),
  }
  config.mode = "production"
  config.optimization = {
    splitChunks: {
      cacheGroups: {
        vendor: {
          test: /[\\/]node_modules[\\/]/,
          name: "vendors",
          enforce: true,
          chunks: "all"
        }
      }
    },
    minimize: true,
    minimizer: [`...`, new cssMinimizerPlugin()]
  }
  config.plugins.push(
    new CleanWebpackPlugin(), 
    new MiniCssExtractPlugin({filename: 'styles.[chunkhash].css'}),
    new RunAfterCompile()
  )
}

module.exports = config
