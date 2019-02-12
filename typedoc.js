module.exports = {
  name: 'Midway Api Reference',
  mode: 'file',
  out: 'docs/.vuepress/dist/api-reference/',
  target: 'ES2015',
  moduleResolution: 'node',
  src: [
    'packages/midway/src',
    'packages/midway-core/src',
    'packages/midway-mock/src',
    'packages/midway-web/src'
  ],
  theme: 'default',
  ignoreCompilerErrors: true,
  preserveConstEnums: true,
  exclude: '*.spec.ts',
  // 'external-modulemap': '.*packages\/.*',
  stripInternal: false
};
