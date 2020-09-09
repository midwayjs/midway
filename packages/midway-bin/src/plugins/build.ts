import { BasePlugin } from '@midwayjs/fcli-command-core';
import { existsSync } from 'fs-extra';
import { resolve, join, relative } from 'path';
import {
  CompilerHost,
  Program,
  resolveTsConfigFile,
} from '@midwayjs/mwcc';
import { AnalyzeResult, Locator } from '@midwayjs/locate';

export class BuildPlugin extends BasePlugin {
  commands: {
    build: {
      usage: 'Usage: midway-bin dev [dir] [options]';
      lifecycleEvents: ['build'];
      options: {
        clean: {
          usage: 'clean build target dir';
          shortcut: 'c';
        };
      };
    };
  };
  hooks = {
    'build:cleanup': this.cleanup.bind(this),
    'build:compile': this.compile.bind(this),
  };

  servicePath: string;
  codeAnalyzeResult: AnalyzeResult;
  compilerHost;
  program;

  async cleanup() {
    // 分析目录结构
    const locator = new Locator(this.servicePath);
    this.codeAnalyzeResult = await locator.run();
    this.setStore('codeAnalyzeResult', this.codeAnalyzeResult);
    this.core.debug('codeAnalyzeResult', this.codeAnalyzeResult);
    this.core.cli.log('Information');
    this.core.cli.log(` - BaseDir: ${this.servicePath}`);
    this.core.cli.log(' - AnalyzeResult');
    this.core.cli.log(
      `   - ProjectType: ${this.codeAnalyzeResult.projectType}`
    );
    if (this.codeAnalyzeResult.midwayRoot) {
      // 输出 midway-* 项目根路径
      this.core.cli.log(
        `   - MidwayRoot: ${
          this.servicePath === this.codeAnalyzeResult.midwayRoot
            ? '.'
            : relative(this.servicePath, this.codeAnalyzeResult.midwayRoot)
        }`
      );
      // 输出 ts 代码根路径
      this.core.cli.log(
        `   - TSCodeRoot: ${relative(
          this.servicePath,
          this.codeAnalyzeResult.tsCodeRoot
        )}`
      );
      this.options.sourceDir = relative(
        this.servicePath,
        this.codeAnalyzeResult.tsCodeRoot
      );
    }
  }

  async compile() {
    // 不存在 tsconfig，跳过编译
    if (!existsSync(resolve(this.servicePath, 'tsconfig.json'))) {
      return;
    }
    const tsCodeRoot: string = this.codeAnalyzeResult.tsCodeRoot;

    const { config } = resolveTsConfigFile(
      this.servicePath,
      join(this.servicePath, 'dist'),
      undefined,
      this.getStore('mwccHintConfig', 'global'),
      {
        compilerOptions: {
          sourceRoot: '../src',
          rootDir: tsCodeRoot,
        },
        include: [tsCodeRoot],
      }
    );
    this.compilerHost = new CompilerHost(this.servicePath, config);
    this.program = new Program(this.compilerHost);

    this.core.cli.log(' - Using tradition build mode');
    this.program.emit();
    this.core.cli.log(' - Build project complete');
  }
}
