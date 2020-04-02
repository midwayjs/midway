import { BasePlugin, getSpecFile } from '@midwayjs/fcli-command-core';
import { AnalyzeResult, Locator } from '@midwayjs/locate';
import {
  compareFileChange,
  copyFiles,
  CodeAny,
} from '@midwayjs/faas-util-ts-compile';
import { compileWithOptions } from '@midwayjs/mwcc';
import { writeWrapper } from '@midwayjs/serverless-spec-builder';
import { createRuntime } from '@midwayjs/runtime-mock';
import * as FCTrigger from '@midwayjs/serverless-fc-trigger';
import { resolve, relative, join } from 'path';
import { FaaSStarterClass, cleanTarget } from './utils';
import { ensureFileSync, existsSync, writeFileSync, remove, readFileSync, copy } from 'fs-extra';
export * from './invoke';
const commonLock: any = {};
enum LOCK_TYPE {
  INITIAL,
  WAITING,
  COMPLETE
}
export class FaaSInvokePlugin extends BasePlugin {
  baseDir: string;
  buildDir: string;
  invokeFun: any;
  codeAnalyzeResult: AnalyzeResult;
  skipTsBuild: boolean;
  buildLockPath: string;
  entryInfo: any;
  fileChanges: any;
  defaultTmpFaaSOut = './node_modules/.faas_out';
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

  getLock(lockKey) {
    if (!commonLock[lockKey]) {
      commonLock[lockKey] = { lockType: LOCK_TYPE.INITIAL, lockData: {}};
    }
    return commonLock[lockKey];
  }

  setLock(lockKey, status, data?) {
    commonLock[lockKey].lockType = status;
    commonLock[lockKey].lockData = data;
  }

  async waitForLock(lockKey, count?) {
    count = count || 0;
    return new Promise(resolve => {
      if (count > 100) {
        return resolve();
      }
      const { lockType, lockData } = this.getLock(lockKey);
      if (lockType === LOCK_TYPE.WAITING) {
        setTimeout(() => {
          this.waitForLock(lockKey, count + 1).then(resolve);
        }, 300);
      } else {
        resolve(lockData);
      }
    });
  }

  async locator() {
    this.baseDir = this.core.config.servicePath;
    this.buildDir = resolve(this.baseDir, '.faas_debug_tmp');
    const lockKey = `codeAnalyzeResult:${this.baseDir}`;
    const { lockType, lockData } = this.getLock(lockKey);
    let codeAnalyzeResult: any;
    if (lockType === LOCK_TYPE.INITIAL) {
      this.setLock(lockKey, LOCK_TYPE.WAITING);
      // 分析目录结构
      const locator = new Locator(this.baseDir);
      codeAnalyzeResult = await locator.run({
        tsCodeRoot: this.options.sourceDir,
        tsBuildRoot: this.buildDir,
      });
      this.setLock(lockKey, LOCK_TYPE.COMPLETE, codeAnalyzeResult);
    } else if (lockType === LOCK_TYPE.COMPLETE) {
      codeAnalyzeResult = lockData;
    } else if (lockType === LOCK_TYPE.WAITING) {
      codeAnalyzeResult = await this.waitForLock(lockKey);
    }
    this.codeAnalyzeResult = codeAnalyzeResult;
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
    this.skipTsBuild = false;
    process.env.MIDWAY_TS_MODE = 'false';
    // 构建锁文件
    const buildLockPath = this.buildLockPath = resolve(this.buildDir, '.faasTSBuildInfo.log');
    const { lockType } = this.getLock(this.buildLockPath);
    // 如果当前存在构建任务，那么久进行等待
    if (lockType === LOCK_TYPE.INITIAL) {
      this.setLock(this.buildLockPath, LOCK_TYPE.WAITING);
    } else if (lockType === LOCK_TYPE.WAITING) {
      await this.waitForLock(this.buildLockPath);
    }

    const specFile = getSpecFile(this.baseDir).path;
    const relativeTsCodeRoot = relative(this.baseDir, this.codeAnalyzeResult.tsCodeRoot) || '.';
    if (existsSync(buildLockPath)) {
      this.fileChanges = await compareFileChange(
        [
          specFile,
          `${relativeTsCodeRoot}/**/*`,
          `${this.defaultTmpFaaSOut}/src/**/*`, // 允许用户将ts代码生成到此文件夹
        ],
        [buildLockPath],
        { cwd: this.baseDir }
      );
      if (!this.fileChanges || !this.fileChanges.length) {
        if (!this.core.service.functions) {
          this.core.service.functions = JSON.parse(readFileSync(buildLockPath).toString());
        }
        this.setLock(this.buildLockPath, LOCK_TYPE.COMPLETE);
        this.skipTsBuild = true;
        this.setStore('skipTsBuild', true);
        this.core.debug('Auto skip ts compile');
        return;
      }
    } else {
      this.fileChanges = [
        `${relativeTsCodeRoot}/**/*`,
        `${this.defaultTmpFaaSOut}/src/**/*`,
      ];
    }
    this.setLock(this.buildLockPath, LOCK_TYPE.WAITING);
    ensureFileSync(buildLockPath);
    writeFileSync(buildLockPath, JSON.stringify(this.core.service.functions));
  }

  async analysisCode() {
    if (this.skipTsBuild) {
      return;
    }
    if (this.core.service.functions) {
      return this.core.service.functions;
    }
    const newSpec: any = await CodeAny({
      spec: this.core.service,
      baseDir: this.baseDir,
      sourceDir: this.fileChanges
    });
    this.core.service.functions = newSpec.functions;
    writeFileSync(this.buildLockPath, JSON.stringify(newSpec.functions));
  }

  async compile() {
    if (this.skipTsBuild) {
      return;
    }

    this.core.debug('Compile', this.codeAnalyzeResult);
    try {
      const dest = join(this.buildDir, 'dist');
      await compileWithOptions(this.baseDir, dest, {
        include: [].concat(this.fileChanges)
      });
    } catch (e) {
      await remove(this.buildLockPath);
      this.setLock(this.buildLockPath, LOCK_TYPE.COMPLETE);
      this.core.debug('Typescript Build Error', e);
      throw new Error(`Typescript Build Error, Please Check Your FaaS Code!`);
    }
    this.setLock(this.buildLockPath, LOCK_TYPE.COMPLETE);
    // 针对多次调用清理缓存
    Object.keys(require.cache).forEach(path => {
      if (path.indexOf(this.buildDir) !== -1) {
        this.core.debug('Clear Cache', path);
        delete require.cache[path];
      }
    });
  }

  checkUserEntry() {
    const funcInfo = this.getFunctionInfo();
    const [handlerFileName, name] = funcInfo.handler.split('.');
    const fileName = resolve(this.buildDir, `${handlerFileName}.js`);
    const userEntry = [
      resolve(this.baseDir, `${handlerFileName}.js`),
      resolve(this.baseDir, `${this.defaultTmpFaaSOut}/${handlerFileName}.js`),
    ].find(existsSync);
    return {
      funcInfo,
      name,
      userEntry,
      fileName
    };
  }

  async entry() {
    const { funcInfo , name, fileName, userEntry } = this.checkUserEntry();
    if (!userEntry) {
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

      writeWrapper({
        baseDir: this.baseDir,
        service: {
          layers: this.core.service.layers,
          functions: { [this.options.function]: funcInfo },
        },
        distDir: this.buildDir,
        starter: starterName,
      });
    } else {
      copy(userEntry, fileName);
    }
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
