import { isTypeScriptEnvironment } from '@midwayjs/bootstrap';
import { basename, join } from 'path';

export const parseNormalDir = (baseDir: string, isTypescript = true) => {
  if (isTypescript) {
    if (/src$/.test(baseDir) || /dist$/.test(baseDir)) {
      baseDir = basename(baseDir);
    }

    const isTypeScriptEnv = isTypeScriptEnvironment();

    if (isTypeScriptEnv) {
      return {
        baseDir: join(baseDir, 'src'),
        appDir: baseDir,
      };
    } else {
      return {
        baseDir: join(baseDir, 'dist'),
        appDir: baseDir,
      };
    }
  } else {
    // js baseDir
    return {
      baseDir,
      appDir: baseDir,
    };
  }
};

export const syncEnvironment = () => {
  const setEnv = envValue => {
    process.env.MIDWAY_SERVER_ENV = process.env.MIDWAY_SERVER_ENV || envValue;
    process.env.NODE_ENV = process.env.NODE_ENV || envValue;
    process.env.EGG_SERVER_ENV = process.env.EGG_SERVER_ENV || envValue;
  };

  if (process.env.EGG_SERVER_ENV) {
    setEnv(process.env.EGG_SERVER_ENV);
  } else if (process.env.MIDWAY_SERVER_ENV) {
    setEnv(process.env.MIDWAY_SERVER_ENV);
  } else if (process.env.NODE_ENV) {
    setEnv(process.env.NODE_ENV);
  }
};
