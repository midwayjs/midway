import { MIDWAY_LOGGER_WRITEABLE_DIR, MidwayAppInfo } from '../interface';
import { isDevelopmentEnvironment } from '../util/';
import { join } from 'path';

export default (appInfo: MidwayAppInfo) => {
  return {
    midwayLogger: {
      default: {
        dir: join(
          process.env[MIDWAY_LOGGER_WRITEABLE_DIR] ?? appInfo.root,
          'logs',
          appInfo.name
        ),
        level: isDevelopmentEnvironment ? 'info' : 'warn',
      },
      clients: {
        coreLogger: {
          fileLogName: 'midway-core.log',
        },
        logger: {
          fileLogName: 'midway-app.log',
        },
      },
    },
  };
};
