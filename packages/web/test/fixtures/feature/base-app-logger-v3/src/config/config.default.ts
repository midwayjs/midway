'use strict';

import * as path from 'path';
export default (appInfo) => {
  return {
    keys: 'key',
    midwayLogger: {
      clients: {
        abc: {
          fileLogName: 'abc.log',
        },
      }
    },
    customLogger: {
      custom: {
        file: path.join(appInfo.root, 'logs/custom.log'),
      }
    }
  }
}
