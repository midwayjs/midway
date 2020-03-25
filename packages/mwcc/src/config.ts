import * as ts from 'typescript';
import * as fs from 'fs';
import { MwccOptions } from './iface';

export function getDefaultOptions(projectDir: string, outputDir: string): MwccOptions {
  return {
    compilerOptions: {
      experimentalDecorators: true,
      sourceMap: true,
      inlineSourceMap: false,
      inlineSources: false,
      outDir: outputDir,
      rootDir: 'src',
      listEmittedFiles: true,
    },
    exclude: ['**/node_modules'],
  };
}

export function mergeCompilerOptions(base: ts.CompilerOptions, target: ts.CompilerOptions) {
  const compilerOptions = Object.assign({}, base, target);
  if (target?.inlineSourceMap) {
    delete compilerOptions.sourceMap;
  }
  return compilerOptions;
}

export function resolveTsConfigFile(projectDir: string): ts.ParsedCommandLine {
  const tsconfigPath = ts.findConfigFile(process.cwd(), (filename) => {
    try {
      const stat = fs.statSync(filename);
      return stat.isFile();
    } catch {
      return false;
    }
  });
  const tsconfigSource = ts.readJsonConfigFile(tsconfigPath, (filename) => {
    try {
      return fs.readFileSync(filename, 'utf8');
    } catch {
      return;
    }
  });
  const cli = ts.parseJsonSourceFileConfigFileContent(tsconfigSource, ts.sys, projectDir);
  return cli;
}
