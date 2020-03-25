import * as ts from 'typescript';
import * as globby from 'globby';
import * as fs from 'fs';
import * as path from 'path';
import * as os from 'os';
import bundler from './plugin/bundler';
import { MwccOptions, MwccPluginContext as MwccContext } from './iface';
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

export async function mwcc(projectDir: string, outputDir: string, options?: MwccOptions) {
  projectDir = path.resolve(projectDir);
  const originalCWD = process.cwd();
  process.chdir(projectDir);
  if (options == null) {
    options = {};
  }
  const defaultOptions = getDefaultOptions(projectDir, outputDir);
  const compilerOptions = mergeCompilerOptions(defaultOptions.compilerOptions, options.compilerOptions);
  const derivedRootDir = compilerOptions.rootDir;
  const derivedOutputDir = compilerOptions.outDir;

  const projectFiles = globby.sync('**/*.ts', {
    ...globOptions,
    cwd: projectDir,
  });

  const context: MwccContext = {
    options,
    files: projectFiles,
    outFiles: [],
    projectDir,
    derivedOutputDir,
    buildDir: fs.mkdtempSync(path.join(os.tmpdir(), 'mwcc-')),
    getTsOutputPath(filename) {
      if (path.isAbsolute(filename) && !filename.startsWith(projectDir)) {
        return undefined;
      }

      const relPath = path.relative(derivedRootDir, filename);
      const basename = path.basename(relPath).replace(/\.tsx?$/, '');
      return path.join(context.buildDir, path.dirname(relPath), basename + '.js');
    }
  }
  compilerOptions.outDir = context.buildDir;
  /**
   * 1. compile TypeScript files
   */
  const host = ts.createCompilerHost(compilerOptions);
  const program = ts.createProgram(projectFiles, compilerOptions, host);
  const emitResult = program.emit();
  context.outFiles = emitResult.emittedFiles;

  const allDiagnostics = ts
    .getPreEmitDiagnostics(program)
    .concat(emitResult.diagnostics);

  const reporter = getDiagnosticReporter(options);

  ts.sortAndDeduplicateDiagnostics(allDiagnostics)
    .forEach(reporter);

  /**
   * 2. Run plugins
   */
  if (options.plugins?.bundler) {
    await bundler(context, host);
  }

  finalizeFileSystem(context, host);
  const summary = generateBuildSummary(context);
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

function finalizeFileSystem(context: MwccContext, host: ts.CompilerHost) {
  for (let file of context.outFiles) {
    const content = host.readFile(file);
    const filename = path.join(context.derivedOutputDir, path.relative(context.buildDir, file));
    host.writeFile(filename, content, false);
  }
  context.outFiles = context.outFiles.map(it => {
    return path.join(context.derivedOutputDir, path.relative(context.buildDir, it));
  });
}

function generateBuildSummary(context: MwccContext) {
  return {
    ...context.options,
    build: {
      inputFiles: context.files,
      outputFiles: context.outFiles,
    },
    versions: {
      mwcc: require('../package.json').version,
      typescript: require(require.resolve('typescript/package.json')).version,
    }
  };
}
