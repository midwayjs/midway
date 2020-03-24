import * as ts from 'typescript';
import * as globby from 'globby';
import * as fs from 'fs';
import * as path from 'path';
import { MwccOptions } from './iface';
import { mergeCompilerOptions, getDefaultOptions } from './config';

const globOptions = {
  followSymbolicLinks: false,
  ignore: [
    '**/node_modules/**', // 模块依赖目录
    '**/test/**', // 测试目录
    '**/run/**', // egg 运行调试目录
    '**/public/**', // 公共assets目录
    '**/build/**', // 构建产物目录
    '**/dist/**', // 构建产物目录
    '**/.serverless/**', // faas 构建目录
    '**/faas_debug_tmp/**', // faas 调试临时目录
  ],
};

export function mwcc(projectDir: string, outputDir: string, options?: MwccOptions) {
  const originalCWD = process.cwd();
  process.chdir(projectDir);
  if (options == null) {
    options = {};
  }
  const defaultOptions = getDefaultOptions(projectDir, outputDir);
  const compilerOptions = mergeCompilerOptions(defaultOptions.compilerOptions, options.compilerOptions);
  const derivedOutputDir = compilerOptions.outDir;

  const projectFiles = globby.sync('**/*.ts', {
    ...globOptions,
    cwd: projectDir,
  });
  /**
   * 1. compile TypeScript files
   */
  const host = ts.createCompilerHost(compilerOptions);
  const program = ts.createProgram(projectFiles, compilerOptions, host);
  const emitResult = program.emit();

  const allDiagnostics = ts
    .getPreEmitDiagnostics(program)
    .concat(emitResult.diagnostics);

  const reporter = getDiagnosticReporter(options);

  ts.sortAndDeduplicateDiagnostics(allDiagnostics)
    .forEach(reporter);

  /**
   * 2. Run plugins
   */

  const summary = generateBuildSummary(projectFiles, options, emitResult);
  fs.writeFileSync(path.join(derivedOutputDir, 'midway.build.json'), JSON.stringify(summary));
  process.chdir(originalCWD);
  return { summary, diagnostics: allDiagnostics };
}

function getDiagnosticReporter(options: MwccOptions): ts.DiagnosticReporter {
  if ((ts as any).createDiagnosticReporter) {
    return (ts as any).createDiagnosticReporter(ts.sys, true);
  }
  return reportDiagnostic;
}

function reportDiagnostic(diagnostic: ts.Diagnostic) {
  if (diagnostic.file) {
    const { line, character } = diagnostic.file.getLineAndCharacterOfPosition(diagnostic.start);
    const message = ts.flattenDiagnosticMessageText(diagnostic.messageText, '\n');
    console.log(`${diagnostic.file.fileName} (${line + 1},${character + 1}): ${message}`);
  } else {
    console.log(ts.flattenDiagnosticMessageText(diagnostic.messageText, '\n'));
  }
}

function generateBuildSummary(projectFiles: string[], options: MwccOptions, emitResult: ts.EmitResult) {
  return {
    ...options,
    build: {
      inputFiles: projectFiles,
      outputFiles: emitResult.emittedFiles,
    },
    versions: {
      mwcc: require('../package.json').version,
      typescript: require(require.resolve('typescript/package.json')).version,
    }
  };
}
