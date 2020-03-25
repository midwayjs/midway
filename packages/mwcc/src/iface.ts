import * as ts from 'typescript';

export type CodeCacheVariant = 'node-v12' | 'node-v10';

export interface BundlerOptions {
  entries: {
    [name: string]: string
  };
  codecache: CodeCacheVariant;
}

export interface MwccOptions {
  compilerOptions?: ts.CompilerOptions;
  include?: string[];
  exclude?: string[];
  plugins?: {
    bundler?: BundlerOptions,
  };
}

export interface MwccBuildSummary extends MwccOptions {
  build: {
    files: string[],
  };
}

export interface MwccPluginContext {
  options: MwccOptions;
  files: string[];
  outFiles: string[];
  projectDir: string;
  buildDir: string;
  derivedOutputDir: string;
  getTsOutputPath: (filename: string) => string;
}

export interface MwccCompilerHost extends ts.CompilerHost {

}
