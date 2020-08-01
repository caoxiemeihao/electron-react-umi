const path = require('path');

const isDev = process.env.NODE_ENV === 'development';
const isProd = process.env.NODE_ENV === 'production';
const resolvePath = (...args: Array<string>) => path.join(__dirname, ...args);

const webpack_dev = (config: any) =>
  config
    .devtool('eval-source-map') // 能看懂的 source-map
    .target('electron-renderer')
    .node.set('fs', false)
    .set('__dirname', false)
    .set('__filename', false)
    .set('child_process', false);

const webpack_prod = (config: any) =>
  config
    .target('electron-renderer')
    .node.set('fs', false)
    .set('__dirname', false)
    .set('__filename', false)
    .set('child_process', false);

const chainWebpack = (config: any) =>
  isProd ? webpack_prod(config) : webpack_dev(config);

export default {
  chainWebpack,
  // 是否编译 node_modules
  nodeModulesTransform: {
    type: 'none',
  },
  // 生成资源带 hash 尾缀
  // 开发模式下 umi 会忽略此选项，不然热重载会出问题(很贴心)
  hash: true,
  // url 格式
  history: {
    // type: 'browser', // file:// 模式下会出点儿问题 😥
    type: 'hash',
  },
  // script、link 标签资源引入路径
  publicPath: './',
  // antd 主题配置
  theme: {
    '@primary-color': '#FF7700',
    '@link-color': '#FF9900',
    '@font-family': '"futura-pt", sans-serif',
    '@font-size-base': '12px',
  },
  // 路径别名
  alias: {
    '@': resolvePath(''),
    '@@': resolvePath('.umi'),
    root: resolvePath('..', '..'), // 项目根目录
  },
  define: {
    APP_THEME: '#FF7700',
  },
};
