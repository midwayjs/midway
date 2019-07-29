import * as path from 'path';

export default (appInfo: any) => {
  const config: any = {};

  // use for cookie sign key, should change to your own and keep security
  config.keys = appInfo.name + '_1541510581780_3944';

  config.middleware = [];

  config.view = {
    templateViewEngine: 'nunjucks',
    root: path.join(appInfo.appDir, 'src/app/view'),
    mapping: {
      '.html': 'nunjucks',
    },
  };

  config.assets = {
    publicPath: 'public',
  };

  return config;
};
