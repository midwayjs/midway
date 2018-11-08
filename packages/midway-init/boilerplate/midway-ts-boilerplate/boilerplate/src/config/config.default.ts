export = (appInfo: any) => {
  const config: any = exports = {};

  // use for cookie sign key, should change to your own and keep security
  config.keys = appInfo.name + '_{{keys}}';

  // add your config here
  config.middleware = [
  ];

  // watch default file state
  config.development = {
    watchDirs: [
      'app',
      'lib',
      'config',
      'app.ts',
      'agent.ts',
      'interface.ts',
    ],
    overrideDefault: true,
  };

  return config;
};
