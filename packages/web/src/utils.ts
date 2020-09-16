import { isTypeScriptEnvironment } from '@midwayjs/bootstrap';
import { basename, join } from 'path';

const isTypeScriptEnv = isTypeScriptEnvironment();

export const parseNormalDir = (baseDir: string, isTypescript = true) => {
  if (isTypescript) {
    if (/src$/.test(baseDir) || /dist$/.test(baseDir)) {
      baseDir = basename(baseDir);
    }

    if (isTypeScriptEnv) {
      return {
        baseDir: join(baseDir, 'src'),
        appDir: baseDir
      };
    } else {
      return {
        baseDir: join(baseDir, 'dist'),
        appDir: baseDir
      };
    }
  } else {
    // js baseDir
    return {
      baseDir,
      appDir: baseDir
    };
  }
};
