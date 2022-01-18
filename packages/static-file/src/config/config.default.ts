import { StaticFileOptions } from '../interface';
import { join } from 'path';

export default appInfo => {
  return {
    staticFile: {
      dirs: {
        default: {
          prefix: '/public',
          dir: join(appInfo.appDir, 'public'),
        },
      },
      dynamic: true,
      preload: false,
      buffer: false,
      maxFiles: 1000,
    },
  } as {
    staticFile: StaticFileOptions;
  };
};
