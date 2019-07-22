import { EggAppConfig, EggAppInfo, PowerPartial } from 'midway';
import * as path from 'path';

export type DefaultConfig = PowerPartial<EggAppConfig>

export default (appInfo: EggAppInfo) => {
  const config = <DefaultConfig> {};

  // use for cookie sign key, should change to your own and keep security
  config.keys = appInfo.name + '_1541510581780_3944';

  config.middleware = [];

  config.view = {
    templateViewEngine: 'nunjucks',
    root: path.join(appInfo.appDir, 'src/app/view'),
    mapping: {
      '.html': 'nunjucks'
    }
  };

  config.assets = {
    publicPath: 'public'
  };

  return config;
};
