import { join, relative, resolve } from 'path';
import { readFileSync, existsSync } from 'fs-extra';
import { BuildCommand } from 'midway-bin';
import { combineTsConfig } from './utils';

export const tsIntegrationProjectCompile = async (baseDir, options: {
  buildRoot: string;
  tsCodeRoot: string;
  incremental: boolean;
  tsConfig?: any; // 临时的ts配置
  clean: boolean;
}) => {
  const tsConfig = await tsCompile(baseDir, {
    tsConfig: options.tsConfig,
    clean: options.clean,
    incremental: options.incremental,
    innerTsConfig: {
      compileOnSave: true,
      compilerOptions: {
        incremental: !!options.incremental,
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
        outDir: relative(
          baseDir,
          join(options.buildRoot, 'dist')
        ),
      },
      include: [
        `${relative(
          baseDir,
          options.tsCodeRoot
        )}/**/*`
      ],
      exclude: ['dist', 'node_modules', 'test'],
    }
  });
  return tsConfig;
};

/**
 * 通用 tsc 构建
 * @param baseDir 项目根目录
 * @param options
 * @param options.source ts 文件所在的目录，比如 src
 * @param options.tsConfigName tsconfig.json 名
 * @param options.clean 是否在构建前清理
 */
export const tsCompile = async (baseDir: string, options: {
  tsConfigName?: string;
  clean?: boolean;
  innerTsConfig?: any;
  tsConfig?: any; // extra tsconfig
  incremental?: boolean;
} = {}) => {
  const builder = new BuildCommand();
  let tsJson = null;
  if (options.tsConfigName) {
    try {
      tsJson = JSON.parse(readFileSync(resolve(baseDir, options.tsConfigName)).toString());
    } catch (e) {}
  }
  const tsConfig = combineTsConfig({}, options.innerTsConfig, options.tsConfig, tsJson);

  if (tsConfig.compilerOptions) {
    if (tsConfig.compilerOptions.inlineSourceMap) {
      tsConfig.compilerOptions.sourceMap = false;
    }
    if (options.incremental === true || options.incremental === false) {
      tsConfig.compilerOptions.incremental = options.incremental;
    }
    if (tsConfig.compilerOptions.incremental) {
      let tsBuildInfoFile = '';
      if (tsConfig.compilerOptions.outDir && existsSync(tsConfig.compilerOptions.outDir)) {
        tsBuildInfoFile = resolve(tsConfig.compilerOptions.outDir, '.tsbuildinfo');
      } else {
        const tmpDir = ['build', 'dist'].find(dirName => existsSync(resolve(baseDir, dirName)));
        tsBuildInfoFile = resolve(tmpDir || baseDir, '.tsbuildinfo');
      }
      tsConfig.compilerOptions.tsBuildInfoFile = tsBuildInfoFile;
    }
  }

  await builder.run({
    cwd: baseDir,
    argv: {
      clean: typeof options.clean === 'undefined' ? true : options.clean,
      tsConfig
    },
  });

  return tsConfig;
};
