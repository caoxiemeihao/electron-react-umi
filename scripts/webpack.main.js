/**
 * 主进程 webpack 配置
 */
const path = require('path');

const resolve = (dir = '') => path.join(__dirname, '../src/main', dir); // 指向 src/main

module.exports = function(env) {
  const isDev = env === 'development';

  return {
    mode: isDev ? 'development' : 'production',
    devtool: isDev ? 'eval-source-map' : 'cheap-module-source-map',
    target: 'electron-main',
    entry: resolve('app.js'),
    output: {
      path: resolve(),
      filename: '_.js',
    },
    node: {
      __dirname: false,
      __filename: false,
    },
    resolve: {
      extensions: ['.js', '.json'],
    },
  };
};
