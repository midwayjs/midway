/*
  单进程模式的invoke
  invoke -> （trigger）-> invokeCore -> entrence -> userCode[ts build]
  1. 用户调用invoke
  2. tsc编译用户代码到dist目录
  3. 开源版: 【创建runtime、创建trigger】封装为平台invoke包，提供getInvoke方法，会传入args与入口方法，返回invoke方法
*/
import { FaaSStarterClass, cleanTarget } from './utils';
import { join, resolve } from 'path';
import { existsSync, move } from 'fs-extra';
import { loadSpec } from '@midwayjs/fcli-command-core';
import { writeWrapper } from '@midwayjs/serverless-spec-builder';
import { AnalyzeResult, Locator } from '@midwayjs/locate';
import {
  tsCompile,
  tsIntegrationProjectCompile,
} from '@midwayjs/faas-util-ts-compile';
import { IInvoke } from './interface';

interface InvokeOptions {
  baseDir?: string; // 目录，默认为process.cwd
  functionName: string; // 函数名
  isDebug?: boolean; // 是否debug
  handler?: string; // 函数的handler方法
  trigger?: string; // 触发器
  buildDir?: string; // 构建目录
  sourceDir?: string; // 函数源码目录
  incremental?: boolean; // 开启增量编译 (会无视 clean true)
  clean?: boolean; // 清理调试目录
}

export abstract class InvokeCore implements IInvoke {
  options: InvokeOptions;
  baseDir: string;
  starter: any;
  spec: any;
  buildDir: string;
  wrapperInfo: any;
  codeAnalyzeResult: AnalyzeResult;

  constructor(options: InvokeOptions) {
    this.options = options;
    this.baseDir = options.baseDir || process.cwd();
    this.buildDir = resolve(this.baseDir, options.buildDir || 'dist');
    this.spec = loadSpec(this.baseDir);
  }

  private async getStarter() {
    if (this.starter) {
      return this.starter;
    }
    const { functionName } = this.options;
    const starter = new FaaSStarterClass({
      baseDir: this.buildDir,
      functionName,
    });
    await starter.start();
    this.starter = starter;
    return this.starter;
  }

  // 获取用户代码中的函数方法
  protected async getUserFaaSHandlerFunction() {
    const handler =
      this.options.handler || this.getFunctionInfo().handler || '';
    const starter = await this.getStarter();
    return starter.handleInvokeWrapper(handler);
  }

  protected getFunctionInfo(functionName?: string) {
    functionName = functionName || this.options.functionName;
    return (
      (this.spec && this.spec.functions && this.spec.functions[functionName]) ||
      {}
    );
  }

  abstract async getInvokeFunction();

  protected async buildTS() {
    const { baseDir } = this.options;
    const tsconfig = resolve(baseDir, 'tsconfig.json');
    // 非ts
    if (!existsSync(tsconfig)) {
      return;
    }
    // 设置走编译，扫描 dist 目录
    process.env.MIDWAY_TS_MODE = 'false';
    const debugRoot = this.options.buildDir || '.faas_debug_tmp';
    // 分析目录结构
    const locator = new Locator(baseDir);
    this.codeAnalyzeResult = await locator.run({
      tsCodeRoot: this.options.sourceDir,
      tsBuildRoot: debugRoot,
    });
    this.buildDir = this.codeAnalyzeResult.tsBuildRoot;
    // clean directory first
    if (!this.options.incremental) {
      await cleanTarget(this.buildDir);
    }
    if (this.codeAnalyzeResult.integrationProject) {
      // 一体化调整目录
      await tsIntegrationProjectCompile(baseDir, {
        sourceDir: 'src',
        buildRoot: this.buildDir,
        tsCodeRoot: this.codeAnalyzeResult.tsCodeRoot,
        incremental: this.options.incremental,
      });
      // remove tsconfig
      await move(
        join(baseDir, 'tsconfig_integration_faas.json'),
        join(this.buildDir, 'tsconfig.json')
      );
    } else {
      // TODO 重构 midway-bin 不生成 tsconfig
      await tsCompile(baseDir, {
        source: 'src',
        tsConfigName: 'tsconfig.json',
        clean: true,
      });
      await move(join(baseDir, 'dist'), join(this.buildDir, 'dist'));
    }
  }

  public async invoke(...args: any) {
    await this.buildTS();
    const invoke = await this.getInvokeFunction();
    this.checkDebug();
    const result = await invoke(...args);
    if (true !== this.options.incremental && false !== this.options.clean) {
      await cleanTarget(this.buildDir);
    }
    return result;
  }

  private async invokeError(err) {
    console.log('[faas invoke error]');
    console.log(err);
    process.exit(1);
  }

  protected async loadHandler(starter: string) {
    const wrapperInfo = await this.makeWrapper(starter);
    const { fileName, handlerName } = wrapperInfo;
    this.wrapperInfo = wrapperInfo;
    try {
      const handler = require(fileName);
      return handler[handlerName];
    } catch (e) {
      this.invokeError(e);
    }
  }

  // 写入口
  private async makeWrapper(starter: string) {
    const funcInfo = this.getFunctionInfo();
    const [handlerFileName, name] = funcInfo.handler.split('.');
    const fileName = resolve(this.buildDir, `${handlerFileName}.js`);

    writeWrapper({
      baseDir: this.baseDir,
      service: {
        layers: this.spec.layers,
        functions: { [this.options.functionName]: funcInfo },
      },
      distDir: this.buildDir,
      starter,
    });
    return { fileName, handlerName: name };
  }

  protected wrapperHandler(handler) {
    return handler;
  }

  private checkDebug() {
    if (!this.options.isDebug) {
      return;
    }
    // tslint:disable-next-line: no-eval
    eval(`
      debugger;
      /*

      Debug 温馨提示

      请点击左侧文件目录中的代码文件进行调试

      ${
        this.wrapperInfo
          ? `
      函数的入口文件所在:

      ${this.wrapperInfo.fileName}  。

      其中 exports.${this.wrapperInfo.handlerName} 方法为函数入口。

      请断点至此函数
      执行至此函数时，会自动生成源代码 sourceMap，方可继续调试。

      感谢使用 midway-faas。

      `
          : ''
      }
      */`);
  }
}
