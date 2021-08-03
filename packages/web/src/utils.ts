import { isTypeScriptEnvironment } from '@midwayjs/bootstrap';
import { basename, join } from 'path';
import { sync as findUpSync, stop } from 'find-up';
import { existsSync } from 'fs';

export const parseNormalDir = (baseDir: string, isTypescript = true) => {
  if (isTypescript) {
    // 这里要么就是 src 目录，要么就已经是根目录
    if (!existsSync(join(baseDir, 'package.json'))) {
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
  const d = new Date(timestamp);
  return `${d.getFullYear()}-${(d.getMonth() + 1)
    .toString()
    .padStart(2, '0')}-${d.getDate().toString().padStart(2, '0')}`;
};
