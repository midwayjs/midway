import { join, relative } from 'path';
import { remove, writeJSON } from 'fs-extra';
import { BuildCommand } from 'midway-bin';

export const tsIntegrationProjectCompile = async (baseDir, options: {
  sourceDir: string;
  buildRoot: string;
  tsCodeRoot: string;
}) => {
  const tsFaaSConfigFilename = 'tsconfig_integration_faas.json';
  // 生成一个临时 tsconfig
  const tempConfigFilePath = join(baseDir, tsFaaSConfigFilename);
  await remove(tempConfigFilePath);
  // 重新写一个新的
  await writeJSON(tempConfigFilePath, {
    compileOnSave: true,
    compilerOptions: {
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
      )}/**/*`,
    ],
    exclude: ['dist', 'node_modules', 'test'],
  });
  await tsCompile(baseDir, {
    clean: true,
    tsConfigName: tsFaaSConfigFilename,
    source: options.sourceDir,
  });
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
  source?: string;
  tsConfigName?: string;
  clean?: boolean;
} = {}) => {
  const builder = new BuildCommand();
  await builder.run({
    cwd: baseDir,
    argv: {
      clean: options.clean || true,
      project: options.tsConfigName || 'tsconfig.json',
      srcDir: options.source || 'src',
    },
  });
};
