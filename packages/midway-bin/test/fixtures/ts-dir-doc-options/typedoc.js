module.exports = {
  name: 'Midway Api Reference',
  mode: 'file',
  out: 'docs/api',
  target: 'ES2015',
  moduleResolution: 'node',
  src: '.',
  theme: 'default',
  ignoreCompilerErrors: true,
  preserveConstEnums: true,
  exclude: '*.spec.ts',
  // 'external-modulemap': '.*packages\/.*',
  stripInternal: false
};
