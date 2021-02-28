module.exports = {
  name: 'Midway Api Reference',
  mode: 'modules',
  out: 'docs/api-reference/',
  theme: './node_modules/typedoc-neo-theme/bin/default',
  exclude: ['**/node_modules/**', '**/*.spec.ts', '**/benchmark/**', '**/test/**'],
  lernaExclude: [
    'midway',
    '@midwayjs/runtime-engine',
    '@midwayjs/runtime-mock',
    '@midwayjs/serverless-aws-starter',
    '@midwayjs/serverless-fc-starter',
    '@midwayjs/serverless-scf-starter',
    '@midwayjs/serverless-http-parser'
  ],
  excludePrivate: true,
  readme: 'none',
  links: [
    {
      label: '首页',
      url: 'https://midwayjs.org'
    },
    {
      label: 'v2 文档',
      url: 'https://www.yuque.com/midwayjs/midway_v2'
    }
  ],
  outline: [
    {
      'Core': {
        '@midwayjs/decorator': '_midwayjs_decorator',
        '@midwayjs/core': '_midwayjs_core',
        '@midwayjs/bootstrap': '_midwayjs_bootstrap'
      },
      'Framework & Component': {
        '@midwayjs/web(EggJS)': '_midwayjs_web',
        '@midwayjs/koa': '_midwayjs_koa',
        '@midwayjs/express': '_midwayjs_express',
        '@midwayjs/grpc': '_midwayjs_grpc',
        '@midwayjs/faas': '_midwayjs_faas',
        '@midwayjs/serverless-app': '_midwayjs_serverless_app',
        '@midwayjs/rabbitmq': '_midwayjs_rabbitmq',
        '@midwayjs/socketio': '_midwayjs_socketio',
        '@midwayjs/typegoose': '_midwayjs_typegoose',
      },
      'Utils': {
        '@midwayjs/mock': '_midwayjs_mock',
        '@midwayjs/logger': '_midwayjs_logger',
        '@midwayjs/serverless-fc-trigger': '_midwayjs_serverless_fc_trigger',
        '@midwayjs/serverless-scf-trigger': '_midwayjs_serverless_scf_trigger',
        '@midwayjs/faas-typings': '_midwayjs_faas_typings',
      }
    }
  ],
  source: [
    {
      'path': 'https://github.com/midwayjs/midway/tree/2.x/',
      'line': 'L'
    }
  ],
  customStyles: [
    {
      'path': '/assets/css/custom.css'
    }
  ]
};
