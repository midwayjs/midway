// https://umijs.org/config/
import os from 'os';
import slash from 'slash2';
import pageRoutes from './router.config';
import webpackPlugin from './plugin.config';
import defaultSettings from '../src/defaultSettings';

const { pwa, primaryColor } = defaultSettings;
const { TEST, NODE_ENV } = process.env;

const plugins = [
  [
    'umi-plugin-react',
    {
      antd: true,
      dva: {
        hmr: true,
      },
      locale: {
        enable: false, // default false
        default: 'zh-CN', // default zh-CN
        baseNavigator: false, // default true, when it is true, will use `navigator.language` overwrite default
      },
      dynamicImport: {
        loadingComponent: './components/PageLoading/index',
        webpackChunkName: true,
        level: 3,
      },
      pwa: pwa
        ? {
            workboxPluginMode: 'InjectManifest',
            workboxOptions: {
              importWorkboxFrom: 'local',
            },
          }
        : false,
      ...(!TEST && os.platform() === 'darwin'
        ? {
            dll: {
              include: ['dva', 'dva/router', 'dva/saga', 'dva/fetch'],
              exclude: [
                '@babel/runtime',
                'netlify-lambda',
                '@antv/data-set',
                'bizcharts',
                'bizcharts-plugin-slider',
                'enquire-js',
                'gg-editor',
                'lodash-decorators',
                'memoize-one',
                'numeral',
                'nzh',
                'react-container-query',
                'react-copy-to-clipboard',
                'react-document-title',
                'react-fittext ',
                'react-media',
                'umi-request',
                'react-fittext',
              ],
            },
            hardSource: false,
          }
        : {}),
    },
  ],
];

export default {
  // add for transfer to umi
  plugins,
  treeShaking: true,
  targets: {
    ie: 11,
  },
  devtool: NODE_ENV === 'development' ? 'source-map' : false,
  // 路由配置
  routes: pageRoutes,
  // Theme for antd
  // https://ant.design/docs/react/customize-theme-cn
  theme: {
    'primary-color': primaryColor,
  },
  ignoreMomentLocale: true,
  lessLoaderOptions: {
    javascriptEnabled: true,
  },
  disableRedirectHoist: true,
  cssLoaderOptions: {
    modules: true,
    getLocalIdent: (context, localIdentName, localName) => {
      if (
        context.resourcePath.includes('node_modules') ||
        context.resourcePath.includes('ant.design.pro.less') ||
        context.resourcePath.includes('global.less')
      ) {
        return localName;
      }
      const match = context.resourcePath.match(/src(.*)/);
      if (match && match[1]) {
        const antdProPath = match[1].replace('.less', '');
        const arr = slash(antdProPath)
          .split('/')
          .map(a => a.replace(/([A-Z])/g, '-$1'))
          .map(a => a.toLowerCase());
        return `antd-pro${arr.join('-')}-${localName}`.replace(/--/g, '-');
      }
      return localName;
    },
  },
  chainWebpack: webpackPlugin,
  cssnano: {
    mergeRules: false,
  },

  // extra configuration
  runtimePublicPath: true,
  hash: true,
  history: 'hash',
  outputPath: '../server/src/app/public',
  manifest: {
    fileName: '../../config/manifest.json',
    publicPath: '',
  },
};
