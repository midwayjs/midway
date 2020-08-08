const FCPlugin = {
  mod: '@midwayjs/fcli-plugin-fc',
  name: 'AliyunFCPlugin',
  platform: 'aliyun',
};
const SCFPlugin = {
  mod: '@midwayjs/fcli-plugin-scf',
  name: 'TencentSCFPlugin',
  platform: 'tencent',
};
const AWSPlugin = {
  mod: '@midwayjs/fcli-plugin-aws',
  name: 'AWSLambdaPlugin',
  platform: 'aws',
};
export const plugins = {
  create: { mod: '@midwayjs/fcli-plugin-create', name: 'CreatePlugin' },
  invoke: [
    { mod: '@midwayjs/fcli-plugin-invoke', name: 'FaaSInvokePlugin' },
    { mod: '@midwayjs/fcli-plugin-dev-pack', name: 'DevPackPlugin' },
    { mod: '@midwayjs/fcli-plugin-hooks', name: 'HooksPlugin' },
  ],
  test: { mod: '@midwayjs/fcli-plugin-test', name: 'TestPlugin' },
  package: [
    { mod: '@midwayjs/fcli-plugin-package', name: 'PackagePlugin' },
    { mod: '@midwayjs/fcli-plugin-hooks', name: 'HooksPlugin' },
    FCPlugin,
  ],
  deploy: [
    { mod: '@midwayjs/fcli-plugin-package', name: 'PackagePlugin' },
    { mod: '@midwayjs/fcli-plugin-deploy', name: 'DeployPlugin' },
    FCPlugin,
    SCFPlugin,
    AWSPlugin,
  ],
};
