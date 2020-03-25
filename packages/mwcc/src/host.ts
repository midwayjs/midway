import * as ts from 'typescript';
import globby = require("globby");
import fs = require("fs");
import path = require("path");
import os = require("os");

import { MwccOptions, MwccContext } from "./iface";
import bundler from './plugin/bundler';

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

export default class MwccHost {
  context: MwccContext;

  constructor(private projectDir: string, private options?: MwccOptions) {
    const derivedRootDir = options.compilerOptions.rootDir;
    const derivedOutputDir = options.compilerOptions.outDir;

    const projectFiles = globby.sync('**/*.ts', {
      ...globOptions,
      cwd: projectDir,
    });

    const context = this.context  = {
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
  }

  async run() {
    const compilerOptions = {...this.context.options.compilerOptions};
    compilerOptions.outDir = this.context.buildDir;
    /**
     * 1. compile TypeScript files
     */
    const host = ts.createCompilerHost(compilerOptions);
    const program = ts.createProgram(this.context.files, compilerOptions, host);
    const emitResult = program.emit();
    this.context.outFiles = emitResult.emittedFiles;

    const allDiagnostics = ts
      .getPreEmitDiagnostics(program)
      .concat(emitResult.diagnostics);

    const reporter = this.getDiagnosticReporter();

    ts.sortAndDeduplicateDiagnostics(allDiagnostics)
      .forEach(reporter);

    /**
     * 2. Run plugins
     */
    if (this.options.plugins?.bundler) {
      await bundler(this.context, host);
    }

    this.finalizeFileSystem(host);
    const summary = this.generateBuildSummary();
    return { summary, diagnostics: allDiagnostics};
  }

  getDiagnosticReporter(): ts.DiagnosticReporter {
    if ((ts as any).createDiagnosticReporter) {
      return (ts as any).createDiagnosticReporter(ts.sys, true);
    }
    return this.reportDiagnostic;
  }

  reportDiagnostic = (diagnostic: ts.Diagnostic) => {
    if (diagnostic.file) {
      const { line, character } = diagnostic.file.getLineAndCharacterOfPosition(diagnostic.start);
      const message = ts.flattenDiagnosticMessageText(diagnostic.messageText, '\n');
      console.log(`${diagnostic.file.fileName} (${line + 1},${character + 1}): ${message}`);
    } else {
      console.log(ts.flattenDiagnosticMessageText(diagnostic.messageText, '\n'));
    }
  }

  finalizeFileSystem(host: ts.CompilerHost) {
    for (let file of this.context.outFiles) {
      const content = host.readFile(file);
      const filename = path.join(this.context.derivedOutputDir, path.relative(this.context.buildDir, file));
      host.writeFile(filename, content, false);
    }
    this.context.outFiles = this.context.outFiles.map(it => {
      return path.join(this.context.derivedOutputDir, path.relative(this.context.buildDir, it));
    });
  }

  generateBuildSummary() {
    return {
      ...this.context.options,
      build: {
        inputFiles: this.context.files,
        outputFiles: this.context.outFiles,
      },
      versions: {
        mwcc: require('../package.json').version,
        typescript: require(require.resolve('typescript/package.json')).version,
      }
    };
  }
}
