import { join } from 'path';
import * as extend from 'extend2';

export default appInfo => {
  const originConfig = require('egg-view/config/config.default')(appInfo);
  return extend(true, originConfig, {
    view: {
      root: join(appInfo.appDir, 'view'),
    },
  });
};
