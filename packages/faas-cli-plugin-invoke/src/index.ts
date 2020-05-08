import { BasePlugin } from '@midwayjs/fcli-command-core';
import { AnalyzeResult, Locator } from '@midwayjs/locate';
import {
  compareFileChange,
  copyFiles,
  CodeAny,
} from '@midwayjs/faas-util-ts-compile';
import { compileInProject } from '@midwayjs/mwcc';
import { writeWrapper } from '@midwayjs/serverless-spec-builder';
import { createRuntime } from '@midwayjs/runtime-mock';
import * as FCTrigger from '@midwayjs/serverless-fc-trigger';
import * as SCFTrigger from '@midwayjs/serverless-scf-trigger';
import { resolve, relative, join } from 'path';
import { FaaSStarterClass, cleanTarget } from './utils';
import {
  ensureFileSync,
  existsSync,
  writeFileSync,
  remove,
  readFileSync,
  copy,
  mkdirSync,
  ensureDirSync,
  symlinkSync,
} from 'fs-extra';
export * from './invoke';
const commonLock: any = {};
enum LOCK_TYPE {
  INITIAL,
  WAITING,
  COMPLETE,
}
export class FaaSInvokePlugin extends BasePlugin {
  baseDir: string;
  buildDir: string;
  invokeFun: any;
  codeAnalyzeResult: AnalyzeResult;
  skipTsBuild: boolean;
  buildLockPath: string;
  buildLogDir: string;
  analysisCodeInfoPath: string;
  entryInfo: any;
  fileChanges: any;
  relativeTsCodeRoot: string;
  get defaultTmpFaaSOut() {
    return resolve(
      this.core.config.servicePath,
      '.faas_debug_tmp/faas_tmp_out'
    );
  }
  commands = {
    invoke: {
      usage: '',
      lifecycleEvents: [
        'formatOptions', // 处理参数
        'locator', // 分析目录结构
        'copyFile', // 拷贝文件
        'checkFileChange', // 检查文件是否更新
        'analysisCode', // 代码分析
        'compile', // ts 编译
        'entry', // 生成执行入口
        'getInvoke', // 获取runtime
        'callInvoke', // 进行调用
        'clean', // 进行清理
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
        port: {
          usage: 'start a invoke server use this port, default is 3000',
          shortcut: 'p',
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

    this.setStore('defaultTmpFaaSOut', this.defaultTmpFaaSOut);
  }

  getLock(lockKey) {
    if (!commonLock[lockKey]) {
      commonLock[lockKey] = {
        lockType: LOCK_TYPE.INITIAL,
        lockData: {},
      };
    }
    return commonLock[lockKey];
  }

  setLock(lockKey, status, data?) {
    if (!commonLock[lockKey]) {
      return;
    }
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
    this.buildLogDir = resolve(this.buildDir, 'log');
    ensureDirSync(this.buildLogDir);
    const buildLockPath = (this.buildLockPath = resolve(
      this.buildLogDir,
      '.faasTSBuildInfo.log'
    ));
    this.analysisCodeInfoPath = resolve(this.buildLogDir, '.faasFuncList.log');
    this.relativeTsCodeRoot =
      relative(this.baseDir, this.codeAnalyzeResult.tsCodeRoot) || '.';
    const isTsMode = this.checkIsTsMode();
    if (isTsMode) {
      process.env.MIDWAY_TS_MODE = 'true';
      return;
    }
    const { lockType } = this.getLock(this.buildLockPath);
    this.core.debug('lockType', lockType);
    // 如果当前存在构建任务，那么就进行等待
    if (lockType === LOCK_TYPE.INITIAL) {
      this.setLock(this.buildLockPath, LOCK_TYPE.WAITING);
    } else if (lockType === LOCK_TYPE.WAITING) {
      await this.waitForLock(this.buildLockPath);
    }

    const specFile = this.core.config.specFile.path;
    // 只有当非首次调用时才会进行增量分析，其他情况均进行全量分析
    if (existsSync(buildLockPath)) {
      this.core.debug('buildLockPath', buildLockPath);
      this.fileChanges = await compareFileChange(
        [
          specFile,
          `${this.relativeTsCodeRoot}/**/*`,
          `${this.defaultTmpFaaSOut}/src/**/*`, // 允许用户将ts代码生成到此文件夹
        ],
        [buildLockPath],
        { cwd: this.baseDir }
      );
      if (!this.fileChanges || !this.fileChanges.length) {
        this.getAnaLysisCodeInfo();
        this.setLock(this.buildLockPath, LOCK_TYPE.COMPLETE);
        this.skipTsBuild = true;
        this.setStore('skipTsBuild', true);
        this.core.debug('Auto skip ts compile');
        return;
      }
    } else {
      this.fileChanges = [
        `${this.relativeTsCodeRoot}/**/*`,
        `${this.defaultTmpFaaSOut}/src/**/*`,
      ];
      // 如果没有构建锁，但是存在代码分析，这时候认为上一次是获取了函数列表
      // if (existsSync(this.analysisCodeInfoPath)) {
      //   this.getAnaLysisCodeInfo();
      // }
    }
    this.core.debug('fileChanges', this.fileChanges);
    this.setLock(this.buildLockPath, LOCK_TYPE.WAITING);
  }

  async analysisCode() {
    // 如果在代码分析中止，那么可以从store中获取function信息
    this.setStore('functions', this.core.service.functions);
    // 如果跳过了ts编译，那么也就是说曾经编译过，那么也跳过代码分析
    if (this.skipTsBuild) {
      return;
    }
    // 当spec上面没有functions的时候，启动代码分析
    if (!this.core.service.functions) {
      const codeAnyParams = {
        spec: this.core.service,
        baseDir: this.baseDir,
        sourceDir: [
          `${this.relativeTsCodeRoot}/**/*`,
          `${this.defaultTmpFaaSOut}/src/**/*`,
        ],
      };
      this.core.debug('Code Analysis Params', codeAnyParams);
      const newSpec: any = await CodeAny(codeAnyParams);
      this.core.debug('Code Analysis Result', newSpec);
      this.core.service.functions = newSpec.functions;
      this.setStore('functions', this.core.service.functions);
      writeFileSync(
        this.analysisCodeInfoPath,
        JSON.stringify(newSpec.functions)
      );
    }
    if (
      this.core.pluginManager.options.stopLifecycle === 'invoke:analysisCode'
    ) {
      // LOCK_TYPE.INITIAL 是因为跳过了ts编译，下一次来的时候还是得进行ts编译
      this.setLock(this.buildLockPath, LOCK_TYPE.INITIAL);
    }
    return this.core.service.functions;
  }

  getAnaLysisCodeInfo() {
    // 当spec上面没有functions的时候，利用代码分析的结果
    if (!this.core.service.functions) {
      try {
        this.core.service.functions = JSON.parse(
          readFileSync(this.analysisCodeInfoPath).toString()
        );
      } catch (e) {
        /** ignore */
      }
    }
  }
  async compile() {
    const isTsMode = this.checkIsTsMode();
    if (isTsMode || this.skipTsBuild) {
      return;
    }

    this.core.debug('Compile', this.codeAnalyzeResult);
    try {
      const dest = join(this.buildDir, 'dist');
      if (!existsSync(dest)) {
        mkdirSync(dest);
      }
      const source = [];
      const tmp = [];
      this.fileChanges.forEach((file: string) => {
        if (file.indexOf(this.defaultTmpFaaSOut) !== -1) {
          tmp.push(file);
        } else {
          source.push(file);
        }
      });
      if (source.length) {
        await compileInProject(this.baseDir, dest, undefined, {
          include: source,
          compilerOptions: {
            incremental: this.options.incremental,
            rootDir: this.codeAnalyzeResult.tsCodeRoot,
          },
        });
      }
      if (tmp.length) {
        await compileInProject(this.baseDir, dest, undefined, {
          include: tmp,
          compilerOptions: {
            rootDir: resolve(this.defaultTmpFaaSOut, 'src'),
          },
        });
      }
    } catch (e) {
      await remove(this.buildLockPath);
      this.setLock(this.buildLockPath, LOCK_TYPE.COMPLETE);
      this.core.debug('Typescript Build Error', e);
      throw new Error('Typescript Build Error, Please Check Your FaaS Code!');
    }
    this.setLock(this.buildLockPath, LOCK_TYPE.COMPLETE);
    // 针对多次调用清理缓存
    Object.keys(require.cache).forEach(path => {
      if (path.indexOf(this.buildDir) !== -1) {
        this.core.debug('Clear Cache', path);
        delete require.cache[path];
      }
    });
    ensureFileSync(this.buildLockPath);
    writeFileSync(this.buildLockPath, JSON.stringify(this.fileChanges));
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
      fileName,
    };
  }

  async entry() {
    const { name, fileName, userEntry } = this.checkUserEntry();
    if (!userEntry) {
      const isTsMode = this.checkIsTsMode();
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
          functions: this.core.service.functions,
        },
        distDir: this.buildDir,
        starter: starterName,
        loadDirectory: isTsMode ? [resolve(this.defaultTmpFaaSOut, 'src')] : [],
      });
      if (isTsMode) {
        // ts模式 midway-core 会默认加载入口文件所在目录下的 src 目录里面的ts代码
        // 因此通过软连接的形式将其与原代码目录进行绑定
        const symlinkPath = resolve(this.buildDir, 'src');
        this.core.debug('tsMode symlink', symlinkPath);
        if (!existsSync(symlinkPath)) {
          symlinkSync(
            this.codeAnalyzeResult.tsCodeRoot,
            resolve(this.buildDir, 'src')
          );
        }
      }
    } else {
      copy(userEntry, fileName);
    }
    this.entryInfo = { fileName, handlerName: name };
    this.core.debug('EntryInfo', this.entryInfo);
  }

  async getInvoke() {
    let handler;
    let initHandler;
    let runtime;
    let invoke;
    const platform = this.getPlatform();
    if (this.entryInfo) {
      try {
        const handlerMod = require(this.entryInfo.fileName);
        handler = handlerMod[this.entryInfo.handlerName];
        initHandler = handlerMod.initializer;
      } catch (e) {
        console.log('Get Invoke Handler Error', e);
        // this.invokeError(e);
      }
    }
    if (handler) {
      this.core.debug('Have Handler');
      const runtimeOpts: any = {
        handler,
      };
      if (initHandler) {
        runtimeOpts.initHandler = initHandler;
      }
      runtime = createRuntime(runtimeOpts);
    }

    if (runtime) {
      this.core.debug('Have Runtime');
      invoke = async (...args) => {
        let triggerMap;
        if (platform === 'aliyun') {
          triggerMap = FCTrigger;
        } else if (platform === 'tencent') {
          triggerMap = SCFTrigger;
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
    const provider =
      this.core.service.provider && this.core.service.provider.name;
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
    const functionInfo =
      this.core.service.functions && this.core.service.functions[functionName];
    if (!functionInfo) {
      throw new Error(`Function: ${functionName} not exists`);
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
    const EventClass = triggerMap[triggerName || 'event'];
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

  checkIsTsMode(): boolean {
    // eslint-disable-next-line node/no-deprecated-api
    return !!require.extensions['.ts'];
  }
}
