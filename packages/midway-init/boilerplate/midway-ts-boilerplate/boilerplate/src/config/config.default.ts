module.exports = (appInfo: any) => {
  const config: {
    keys?: string,
    middleware?: any[],
    [propName: string]: any,
  } = exports = {};

  // use for cookie sign key, should change to your own and keep security
  config.keys = appInfo.name + '_{{keys}}';

  // add your config here
  config.middleware = [
    'time',
  ];

  return config;
};
