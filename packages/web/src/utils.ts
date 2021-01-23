import { isTypeScriptEnvironment } from '@midwayjs/bootstrap';
import { basename, join } from 'path';
import { sync as findUpSync, stop } from 'find-up';

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

export const findLernaRoot = (findRoot = process.cwd()) => {
  const userHome = process.env.HOME;
  return findUpSync(
    directory => {
      if (findUpSync.exists(join(directory, 'lerna.json'))) {
        return directory;
      }
      if (directory === userHome) {
        return stop;
      }
    },
    { cwd: findRoot, type: 'directory' }
  );
};

export const getCurrentDateString = (timestamp: number = Date.now()) => {
  // example: 01/23/2021
  const dateString = new Date(timestamp).toLocaleString('en-us', { year: 'numeric', month: '2-digit', day: '2-digit' });
  const arr = dateString.split('/');
  return `${arr[2]}-${arr[0]}-${arr[1]}`;
};
