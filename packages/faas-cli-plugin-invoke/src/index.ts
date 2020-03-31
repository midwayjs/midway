import { BasePlugin, getSpecFile } from '@midwayjs/fcli-command-core';
import { AnalyzeResult, Locator } from '@midwayjs/locate';
import {
  tsCompile,
  tsIntegrationProjectCompile,
  compareFileChange,
  copyFiles,
  CodeAny,
  combineTsConfig
} from '@midwayjs/faas-util-ts-compile';
import { writeWrapper } from '@midwayjs/serverless-spec-builder';
import { createRuntime } from '@midwayjs/runtime-mock';
import * as FCTrigger from '@midwayjs/serverless-fc-trigger';
import { resolve, relative, join } from 'path';
import { FaaSStarterClass, cleanTarget } from './utils';
import { ensureFileSync, existsSync, writeFileSync, move, remove, readFileSync } from 'fs-extra';
export * from './invoke';
const lockMap = {};
enum BUILD_TYPE {
  BUILDING = 1,
  COMPLETE
}
export class FaaSInvokePlugin extends BasePlugin {
  baseDir: string;
  buildDir: string;
  codeAnalyzeResult: AnalyzeResult;
  private skipTsBuild: boolean;
  private buildLockPath: string;
  private entryInfo: any;
  private invokeFun: any;
  commands = {
    invoke: {
      usage: '',
      lifecycleEvents: [
        'formatOptions',      // 处理参数
        'locator',            // 分析目录结构
        'copyFile',           // 拷贝文件
        'checkFileChange',    // 检查文件是否更新
        'analysisCode',       // 代码分析
        'compile',            // ts 编译
        'entry',              // 生成执行入口
        'getInvoke',          // 获取runtime
        'callInvoke',             // 进行调用
        'clean'               // 进行清理
      ],
      options: {
        function: {
          usage: 'function name',
          shortcut: 'f',
        },
        data: {
          usage: 'function args',
          shortcut: 'd',
        },
        debug: {
          usage: 'debug function',
        },
        trigger: {
          usage: 'trigger name',
          shortcut: 't',
        },
      },
    },
  };

  hooks = {
    'invoke:formatOptions': this.formatOptions.bind(this),
    'invoke:locator': this.locator.bind(this),
    'invoke:copyFile': this.copyFile.bind(this),
    'invoke:checkFileChange': this.checkFileChange.bind(this),
    'invoke:analysisCode': this.analysisCode.bind(this),
    'invoke:compile': this.compile.bind(this),
    'invoke:entry': this.entry.bind(this),
    'invoke:getInvoke': this.getInvoke.bind(this),
    'invoke:callInvoke': this.callInvoke.bind(this),
    'invoke:clean': this.clean.bind(this),
  };

  formatOptions() {
    // 开启增量编译，则不自动清理目录
    if (this.options.incremental) {
      this.options.clean = false;
    }
    if (this.options.clean !== false) {
      this.options.clean = true;
    }
  }

  async locator() {
    this.baseDir = this.core.config.servicePath;
    this.buildDir = resolve(this.baseDir, '.faas_debug_tmp');

    // 分析目录结构
    const locator = new Locator(this.baseDir);
    this.codeAnalyzeResult = await locator.run({
      tsCodeRoot: this.options.sourceDir,
      tsBuildRoot: this.buildDir,
    });
  }

  async copyFile() {
    const packageObj: any = this.core.service.package || {};
    // clean directory first
    if (this.options.clean) {
      await cleanTarget(this.buildDir);
    }
    return copyFiles({
      sourceDir: this.baseDir,
      targetDir: this.buildDir,
      include: packageObj.include,
      exclude: packageObj.exclude,
      log: path => {
        this.core.debug('copy file', path);
      },
    });
  }

  async checkFileChange() {
    const tsconfig = resolve(this.baseDir, 'tsconfig.json');
    // 非ts
    if (!existsSync(tsconfig)) {
      this.skipTsBuild = true;
      return;
    }
    process.env.MIDWAY_TS_MODE = 'false';
    // 构建锁文件
    const buildLockPath = this.buildLockPath = resolve(this.buildDir, '.faasTSBuildInfo.log');
    // 如果当前存在构建任务，那么久进行等待
    if (!lockMap[buildLockPath]) {
      lockMap[buildLockPath] = BUILD_TYPE.BUILDING;
    } else if (lockMap[buildLockPath] === BUILD_TYPE.BUILDING) {
      await this.waitForTsBuild(buildLockPath);
    }

    const specFile = getSpecFile(this.baseDir).path;

    if (existsSync(buildLockPath)) {
      const fileChanges = await compareFileChange(
        [
          specFile,
          `${relative(this.baseDir, this.codeAnalyzeResult.tsCodeRoot) || '.'}/**/*`,
        ],
        [buildLockPath],
        { cwd: this.baseDir }
      );
      if (!fileChanges || !fileChanges.length) {
        if (!this.core.service.functions) {
          this.core.service.functions = JSON.parse(readFileSync(buildLockPath).toString());
        }
        lockMap[buildLockPath] = true;
        this.skipTsBuild = true;
        this.setStore('skipTsBuild', true);
        this.core.debug('Auto skip ts compile');
        return;
      }
    }
    lockMap[buildLockPath] = BUILD_TYPE.BUILDING;
    ensureFileSync(buildLockPath);
    const functions = await this.analysisCode();
    writeFileSync(buildLockPath, JSON.stringify(functions));
  }

  async analysisCode() {
    if (this.core.service.functions) {
      return this.core.service.functions;
    }
    const newSpec: any = await CodeAny({
      spec: this.core.service,
      baseDir: this.baseDir,
      sourceDir: this.codeAnalyzeResult.tsCodeRoot
    });
    this.core.service.functions = newSpec.functions;
    return newSpec.functions;
  }

  async compile() {
    if (this.skipTsBuild) {
      return;
    }

    this.core.debug('Compile', this.codeAnalyzeResult);
    const opts = this.options.incremental ? { overwrite: true } : {};
    try {
      if (this.codeAnalyzeResult.integrationProject) {
        // 一体化调整目录
        await tsIntegrationProjectCompile(this.baseDir, {
          buildRoot: this.buildDir,
          tsCodeRoot: this.codeAnalyzeResult.tsCodeRoot,
          incremental: this.options.incremental,
          tsConfig: combineTsConfig({
            compilerOptions: {
              sourceRoot: this.codeAnalyzeResult.tsCodeRoot, // for sourceMap
            },
          }, this.options.tsConfig),
          clean: this.options.clean,
        });
      } else {
        await tsCompile(this.baseDir, {
          tsConfigName: 'tsconfig.json',
          tsConfig: combineTsConfig({
            compilerOptions: {
              sourceRoot: resolve(this.baseDir, 'src'), // for sourceMap
            },
          }, this.options.tsConfig),
          clean: this.options.clean,
        });
        const dest = join(this.buildDir, 'dist');
        if (existsSync(dest)) {
          await remove(dest);
        }
        await move(join(this.baseDir, 'dist'), dest, opts);
      }
    } catch (e) {
      await remove(this.buildLockPath);
      lockMap[this.buildLockPath] = 0;
      this.core.debug('Typescript Build Error', e);
      throw new Error(`Typescript Build Error, Please Check Your FaaS Code!`);
    }
    lockMap[this.buildLockPath] = BUILD_TYPE.COMPLETE;
    // 针对多次调用清理缓存
    Object.keys(require.cache).forEach(path => {
      if (path.indexOf(this.buildDir) !== -1) {
        this.core.debug('Clear Cache', path);
        delete require.cache[path];
      }
    });
  }

  async entry() {
    let starterName;
    const platform = this.getPlatform();
    this.core.debug('Platform entry', platform);
    if (platform === 'aliyun') {
      starterName = require.resolve('@midwayjs/serverless-fc-starter');
    } else if (platform === 'tencent') {
      starterName = require.resolve('@midwayjs/serverless-scf-starter');
    }
    if (!starterName) {
      return;
    }
    const funcInfo = this.getFunctionInfo();
    const [handlerFileName, name] = funcInfo.handler.split('.');
    const fileName = resolve(this.buildDir, `${handlerFileName}.js`);

    writeWrapper({
      baseDir: this.baseDir,
      service: {
        layers: this.core.service.layers,
        functions: { [this.options.function]: funcInfo },
      },
      distDir: this.buildDir,
      starter: starterName,
    });
    this.entryInfo = { fileName, handlerName: name };
    this.core.debug('EntryInfo', this.entryInfo);
  }

  async getInvoke() {
    let handler;
    let runtime;
    let invoke;
    const platform = this.getPlatform();
    if (this.entryInfo) {
      try {
        const handlerMod = require(this.entryInfo.fileName);
        handler = handlerMod[this.entryInfo.handlerName];
      } catch (e) {
        console.log('Get Invoke Handler Error', e);
        // this.invokeError(e);
      }
    }
    if (handler) {
      this.core.debug('Have Handler');
      runtime = createRuntime({
        handler
      });
    }

    if (runtime) {
      this.core.debug('Have Runtime');
      invoke = async (...args) => {
        let triggerMap;
        if (platform === 'aliyun') {
          triggerMap = FCTrigger;
        }
        const trigger = this.getTrigger(triggerMap, args);
        await runtime.start();
        this.core.debug('Invoke', trigger);
        const result = await runtime.invoke(...trigger);
        await runtime.close();
        return result;
      };
    }
    if (!invoke) {
      invoke = await this.getUserFaaSHandlerFunction();
    }
    this.invokeFun = invoke;
  }

  async callInvoke() {
    const resultType = this.options.resultType;
    this.core.debug('ResultType', resultType);
    try {
      let args = this.options.data || '{}';
      if (typeof args === 'string') {
        if (/^\.\//.test(args)) {
          try {
            args = JSON.parse(readFileSync(args).toString());
            this.core.debug('Invoke Local Data', args);
          } catch (e) {
            this.core.debug('Invoke Local Data Parse Error', e);
          }
        } else {
          try {
            args = JSON.parse(args);
            this.core.debug('Invoke JSON Data', args);
          } catch (e) {
            this.core.debug('Invoke JSON Data Parse Error', e);
          }
        }
      }
      this.core.debug('Invoke Args', args);
      const result = await this.invokeFun(...[].concat(args));
      this.core.debug('Result', result);
      if (resultType !== 'store') {
        this.core.cli.log('--------- result start --------');
        this.core.cli.log('');
        this.core.cli.log(JSON.stringify(result));
        this.core.cli.log('');
        this.core.cli.log('--------- result end --------');
      } else {
        this.setStore('result', {
          success: true,
          result,
        });
      }
    } catch (e) {
      this.core.debug('Call Error', e);
      if (resultType !== 'store') {
        const errorLog = this.core.cli.error || this.core.cli.log;
        errorLog(e && e.message ? `[Error] ${e.message}` : e);
      } else {
        this.setStore('result', {
          success: false,
          err: e,
        });
      }
    }
  }

  async clean() {
    if (this.options.clean) {
      await cleanTarget(this.buildDir);
    }
  }

  getPlatform() {
    const provider = this.core.service.provider && this.core.service.provider.name;
    if (provider) {
      if (provider === 'fc' || provider === 'aliyun') {
        return 'aliyun';
      } else if (provider === 'scf' || provider === 'tencent') {
        return 'tencent';
      }
    }
  }

  getFunctionInfo() {
    const functionName = this.options.function;
    const functionInfo = this.core.service.functions && this.core.service.functions[functionName];
    if (!functionInfo) {
      throw new Error(`Function: ${ functionName } not exists`);
    }
    return functionInfo;
  }

  getTrigger(triggerMap, args) {
    if (!triggerMap) {
      return args;
    }
    let triggerName = this.options.trigger;
    if (!triggerName) {
      const funcInfo = this.getFunctionInfo();
      if (funcInfo.events && funcInfo.events.length) {
        triggerName = Object.keys(funcInfo.events[0])[0];
      }
    }
    const EventClass = triggerMap[triggerName];
    if (EventClass) {
      return [new EventClass(...args)];
    }
    return args;
  }

  async getUserFaaSHandlerFunction() {
    const handler =
      this.options.handler || this.getFunctionInfo().handler || '';
    const starter = await this.getStarter();
    return starter.handleInvokeWrapper(handler);
  }

  async getStarter() {
    const { functionName } = this.options;
    const starter = new FaaSStarterClass({
      baseDir: this.buildDir,
      functionName,
    });
    await starter.start();
    return starter;
  }

  waitForTsBuild(buildLogPath, count?) {
    count = count || 0;
    return new Promise(resolve => {
      if (count > 100) {
        return resolve();
      }
      if (lockMap[buildLogPath] === BUILD_TYPE.BUILDING) {
        setTimeout(() => {
          this.waitForTsBuild(buildLogPath, count + 1).then(resolve);
        }, 300);
      } else {
        resolve();
      }
    });
  }
}

export class InvokePlugin extends BasePlugin {
  commands = {
    invoke: {
      usage: '',
      lifecycleEvents: ['invoke'],
      options: {
        function: {
          usage: 'function name',
          shortcut: 'f',
        },
        data: {
          usage: 'function args',
          shortcut: 'd',
        },
        debug: {
          usage: 'debug function',
        },
        trigger: {
          usage: 'trigger name',
          shortcut: 't',
        },
      },
    },
  };

  hooks = {
    'invoke:invoke': async () => {
      if (this.options.remote) {
        return;
      }
      const func = this.options.function;
      try {
        const result = await this.invokeFun(func);
        this.core.cli.log('--------- result start --------');
        this.core.cli.log('');
        this.core.cli.log(JSON.stringify(result));
        this.core.cli.log('');
        this.core.cli.log('--------- result end. --------');
        process.exit();
      } catch (e) {
        const errorLog = this.core.cli.error || this.core.cli.log;
        errorLog(e && e.message ? `[Error] ${e.message}` : e);
        process.exit(1);
      }
    },
  };

  async invokeFun(functionName: string) {
  }
}
