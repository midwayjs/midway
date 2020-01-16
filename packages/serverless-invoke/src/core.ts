/*
  单进程模式的invoke
  invoke -> （trigger）-> invokeCore -> entrence -> userCode[ts build]
  1. 用户调用invoke
  2. tsc编译用户代码到dist目录
  3. 开源版: 【创建runtime、创建trigger】封装为平台invoke包，提供getInvoke方法，会传入args与入口方法，返回invoke方法
*/
import { FaaSStarterClass } from './utils';
import { execSync } from 'child_process';
import { resolve } from 'path';
import { existsSync, writeFileSync, ensureDirSync } from 'fs-extra';
import { loadSpec } from '@midwayjs/fcli-command-core';
import { writeWrapper } from '@midwayjs/serverless-spec-builder';

interface InvokeOptions {
  baseDir?: string;         // 目录，默认为process.cwd
  functionName: string;     // 函数名
  isDebug?: boolean;         // 是否debug
  handler?: string;         // 函数的handler方法
  trigger?: string;         // 触发器
  buildDir?: string;        // 构建目录
}

export class InvokeCore {
  options: InvokeOptions;
  baseDir: string;
  starter: any;
  spec: any;
  buildDir: string;
  wrapperInfo: any;

  constructor(options: InvokeOptions) {
    this.options = options;
    this.baseDir = options.baseDir || process.cwd();
    this.buildDir = resolve(this.baseDir, options.buildDir || 'dist');
    ensureDirSync(this.buildDir);
    this.spec = loadSpec(this.baseDir);
  }

  async getStarter() {
    if (this.starter) {
      return this.starter;
    }
    const { functionName } = this.options;
    const starter = new FaaSStarterClass({
      baseDir: this.buildDir,
      functionName
    });
    await starter.start();
    this.starter = starter;
    return this.starter;
  }

  // 获取用户代码中的函数方法
  async getUserFaasHandlerFunction() {
    const handler = this.options.handler || this.getFunctionInfo().handler || '';
    const starter = await this.getStarter();
    return starter.handleInvokeWrapper(handler);
  }

  getFunctionInfo(functionName?: string) {
    functionName = functionName || this.options.functionName;
    return this.spec && this.spec.functions && this.spec.functions[functionName] || {};
  }

  async getInvokeFunction() {
    const invoke = await this.getUserFaasHandlerFunction();
    return invoke;
  }

  async buildTS() {
    const { baseDir } = this.options;
    process.env.MIDWAY_TS_MODE = 'true';
    const tsconfig = resolve(baseDir, 'tsconfig.json');
    // 非ts
    if (!existsSync(tsconfig)) {
      return;
    }
    const distTsconfig = resolve(this.buildDir, 'tsconfig.json');
    if (!existsSync(distTsconfig)) { // midway-core 扫描判断isTsMode需要
      writeFileSync(distTsconfig, '{}');
    }
    let tsc = 'tsc';
    const tscBuildDir = resolve(this.buildDir, 'src');
    try {
      tsc = resolve(require.resolve('typescript'), '../../bin/tsc');
    } catch (e) {
      return this.invokeError('need typescript');
    }
    try {
      await execSync(`cd ${baseDir};${tsc} --inlineSourceMap --outDir ${tscBuildDir} --skipLibCheck --skipDefaultLibCheck`);
    } catch (e) {
      this.invokeError(e);
    }
  }

  async invoke(...args: any) {
    await this.buildTS();
    const invoke = await this.getInvokeFunction();
    this.checkDebug();
    return invoke(...args);
  }

  async invokeError(err) {
    console.log('[faas invoke error]');
    console.log(err);
    process.exit(1);
  }

  async loadHandler(starter: string) {
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
  async makeWrapper(starter: string) {
    const funcInfo = this.getFunctionInfo();
    const [handlerFileName, name] = funcInfo.handler.split('.');
    const fileName = resolve(this.buildDir, `${handlerFileName}.js`);

    writeWrapper({
      baseDir: this.baseDir,
      service: {
        layers: this.spec.layers,
        functions: {[this.options.functionName]: funcInfo}
      },
      distDir: this.buildDir,
      starter
    });
    return { fileName, handlerName: name };
  }

  wrapperHandler(handler) {
    return handler;
  }

  checkDebug() {
    if (!this.options.isDebug) {
      return;
    }
    // tslint:disable-next-line: no-eval
    eval(`
      debugger;
      /*

      Debug 温馨提示

      请点击左侧文件目录中的代码文件进行调试

      ${this.wrapperInfo ? `
      函数的入口文件所在:

      ${this.wrapperInfo.fileName}  。

      其中 exports.${this.wrapperInfo.handlerName} 方法为函数入口。

      请断点至此函数
      执行至此函数时，会自动生成源代码 sourceMap，方可继续调试。

      感谢使用 midway-faas。

      ` : ''}
      */`);
  }
}
