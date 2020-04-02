import * as globby from 'globby';
import { existsSync, copy, statSync } from 'fs-extra';
import { join } from 'path';

// 符合sourceGlob条件的文件中 是否存在 比所有符合toGlob条件的文件 要新的文件
// 返回 fromGlob 中更新的文件
export const compareFileChange = async (
  fromGlob: string[],
  toGlob: string[],
  options?: any
) => {
  options = options || {};
  if (!options.cwd) {
    options.cwd = process.cwd();
  }
  options.stats = true;
  const fromFiles: any = await globby(fromGlob, options);
  const toFiles: any = await globby(toGlob, options);

  if (!fromFiles || !fromFiles.length) {
    return [];
  }

  if (!toFiles || !toFiles.length) {
    return fromFiles.map((file: any) => file.path);
  }
  let latestFilesChangeTime = 0;
  for (const file of toFiles) {
    if (file.stats.mtimeMs > latestFilesChangeTime) {
      latestFilesChangeTime = file.stats.mtimeMs;
    }
  }
  const result = [];
  for (const file of fromFiles) {
    if (file.stats.mtimeMs > latestFilesChangeTime) {
      result.push(file.path);
    }
  }
  return result;
};

interface ICopyOptions {
  sourceDir: string;
  targetDir: string;
  defaultInclude?: string[];
  include?: string[];
  exclude?: string[];
  log?: (path: string) => void;
}

export const copyFiles = async (options: ICopyOptions) => {
  const {
    defaultInclude,
    include,
    exclude,
    sourceDir,
    targetDir,
    log,
  } = options;
  const paths = await globby(
    (defaultInclude || ['*.yml', '*.js', '*.json', 'app', 'config']).concat(
      include || []
    ),
    {
      cwd: sourceDir,
      followSymbolicLinks: false,
      ignore: [
        '**/node_modules/**', // 模块依赖目录
        '**/test/**', // 测试目录
        '**/run/**', // egg 运行调试目录
        '**/.serverless/**', // faas 构建目录
        '**/.faas_debug_tmp/**', // faas 调试临时目录
      ].concat(exclude || []),
    }
  );
  await Promise.all(
    paths.map((path: string) => {
      const source = join(sourceDir, path);
      const target = join(targetDir, path);
      if (existsSync(target)) {
        const sourceStat = statSync(source);
        const targetStat = statSync(target);
        // source 修改时间小于目标文件 修改时间，则不拷贝
        if (sourceStat.mtimeMs <= targetStat.mtimeMs) {
          return;
        }
      }
      if (log) {
        log(path);
      }
      return copy(source, target);
    })
  );
};

interface InnerTsConfigOptions {
  incremental: boolean;
  outDir: string;
  include: string[];
  exclude: string[];
}

export const innerTsConfigMaker = (options: InnerTsConfigOptions) => {
  return {
    compileOnSave: true,
    compilerOptions: {
      incremental: options.incremental,
      target: 'ES2018',
      module: 'commonjs',
      moduleResolution: 'node',
      experimentalDecorators: true,
      emitDecoratorMetadata: true,
      inlineSourceMap: true,
      noImplicitThis: true,
      noUnusedLocals: true,
      stripInternal: true,
      pretty: true,
      declaration: true,
      jsx: 'react',
      outDir: options.outDir,
    },
    include: options.include || [],
    exclude: options.exclude || [],
  };
};
