const path = require('path');

const isDev = process.env.YPSHOP_ENV === 'development';
const isProd = process.env.YPSHOP_ENV === 'production';
const resolvePath = (dir: string) => path.join(__dirname, dir);

const webpack_dev = (config: any) => config.devtool('eval-source-map');
// .target('electron-renderer')

const webpack_prod = (config: any) => config.target('electron-renderer');

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
    type: 'browser',
  },
  // script、link 标签资源引入路径
  publicPath: './',
  // antd 主题配置
  theme: {
    '@primary-color': '#A14EFF',
    '@link-color': '#A14EFF',
    '@font-family': '"futura-pt", sans-serif',
    '@line-height-base': '1.3',
    '@border-radius-base': '6px',
  },
  // 路径别名
  alias: {
    '@': resolvePath(''),
    '@@': resolvePath('.umi'),
  },
};
