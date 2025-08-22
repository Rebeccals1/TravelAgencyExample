// webpack.config.js
const currentTask = process.env.npm_lifecycle_event; // 'dev', 'serve', or 'build'
const isDev = currentTask === 'dev' || currentTask === 'serve';

const path = require('path');
const { CleanWebpackPlugin } = require('clean-webpack-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const CssMinimizerPlugin = require('css-minimizer-webpack-plugin');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const fse = require('fs-extra');

const postCSSPlugins = [
  require('postcss-import'),
  require('postcss-mixins'),
  require('postcss-simple-vars'),
  require('postcss-nested'),
  require('autoprefixer'),
];

class RunAfterCompile {
  apply(compiler) {
    compiler.hooks.done.tap('Copy Images', function () {
      // Copy images used by the site into the production output
      fse.copySync('./app/assets/images', './docs/assets/images');
    });
  }
}

// Base CSS rule; we’ll prepend the right loader per mode below
const cssRule = {
  test: /\.css$/i,
  use: [
    // dev: 'style-loader' | prod: MiniCssExtractPlugin.loader (added below)
    'css-loader?url=false',
    {
      loader: 'postcss-loader',
      options: { postcssOptions: { plugins: postCSSPlugins } },
    },
  ],
};

// Auto-generate an HtmlWebpackPlugin for each .html file in ./app
const pages = fse
  .readdirSync('./app')
  .filter((file) => file.endsWith('.html'))
  .map(
    (page) =>
      new HtmlWebpackPlugin({
        filename: page,
        template: `./app/${page}`,
      })
  );

const config = {
  entry: './app/assets/scripts/App.js',
  mode: isDev ? 'development' : 'production',
  plugins: [...pages],
  module: {
    rules: [cssRule],
  },
  // Helpful source maps in dev; smaller output in prod
  devtool: isDev ? 'eval-source-map' : 'source-map',
};

if (isDev) {
  // Inject CSS via <style> for fast HMR
  cssRule.use.unshift('style-loader');

  config.output = {
    filename: 'bundled.js',
    path: path.resolve(__dirname, 'app'),
  };

  config.devServer = {
    static: {
      directory: path.join(__dirname, 'app'),
    },
    hot: true,
    compress: true,
    port: 8080,
    open: true,
    watchFiles: ['app/**/*'],
  };
}

if (currentTask === 'build') {
  // Extract CSS to a file in production
  cssRule.use.unshift(MiniCssExtractPlugin.loader);

  // Transpile modern JS for broader browser support in prod
  config.module.rules.push({
    test: /\.js$/,
    exclude: /(node_modules)/,
    use: {
      loader: 'babel-loader',
      options: {
        presets: ['@babel/preset-env'],
      },
    },
  });

  config.output = {
    filename: '[name].[contenthash:8].js',
    path: path.resolve(__dirname, 'docs'),
    clean: true, // clean output dir between builds
  };

  config.optimization = {
    splitChunks: {
      cacheGroups: {
        vendor: {
          test: /[\\/]node_modules[\\/]/,
          name: 'vendors',
          enforce: true,
          chunks: 'all',
        },
      },
    },
    minimize: true,
    minimizer: ['...', new CssMinimizerPlugin()],
  };

  config.plugins.push(
    new CleanWebpackPlugin(),
    new MiniCssExtractPlugin({ filename: 'styles.[contenthash:8].css' }),
    new RunAfterCompile()
  );
}

module.exports = config;
