import { BasePlugin } from '@midwayjs/fcli-command-core';
import { AnalyzeResult, Locator } from '@midwayjs/locate';
import {
  analysisResultToSpec,
  compareFileChange,
  copyFiles
} from '@midwayjs/faas-code-analysis';
import { CompilerHost, Program, resolveTsConfigFile, Analyzer } from '@midwayjs/mwcc';
import { writeWrapper } from '@midwayjs/serverless-spec-builder';
import { createRuntime } from '@midwayjs/runtime-mock';
import * as FCTrigger from '@midwayjs/serverless-fc-trigger';
import * as SCFTrigger from '@midwayjs/serverless-scf-trigger';
import { resolve, relative, join } from 'path';
import { 
  FaaSStarterClass,
  checkIsTsMode,
  cleanTarget,
  getLock,
  getPlatformPath,
  setLock,
  waitForLock,
  LOCK_TYPE, } from './utils';
import {
  ensureFileSync,
  existsSync,
  writeFileSync,
  remove,
  readFileSync,
  copy,
  ensureDirSync,
  symlinkSync,
  mkdirSync,
} from 'fs-extra';
export * from './invoke';
export * from './interface';

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
  analyzedTsCodeRoot: string;

  private compilerHost: CompilerHost;
  private program: Program;

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
        'compile', // ts 代码编译
        'emit', // ts 代码输出
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
    'invoke:compile': this.compile.bind(this),
    'invoke:emit': this.emit.bind(this),
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

  async locator() {
    this.baseDir = this.core.config.servicePath;
    this.buildDir = resolve(this.baseDir, '.faas_debug_tmp');
    const lockKey = `codeAnalyzeResult:${this.baseDir}`;
    const { lockType, lockData } = getLock(lockKey);
    let codeAnalyzeResult;
    if (lockType === LOCK_TYPE.INITIAL) {
      setLock(lockKey, LOCK_TYPE.WAITING);
      // 分析目录结构
      const locator = new Locator(this.baseDir);
      codeAnalyzeResult = await locator.run({
        tsCodeRoot: this.options.sourceDir,
        tsBuildRoot: this.buildDir,
      });
      setLock(lockKey, LOCK_TYPE.COMPLETE, codeAnalyzeResult);
    } else if (lockType === LOCK_TYPE.COMPLETE) {
      codeAnalyzeResult = lockData;
    } else if (lockType === LOCK_TYPE.WAITING) {
      codeAnalyzeResult = await waitForLock(lockKey);
    }
    this.codeAnalyzeResult = codeAnalyzeResult;
  }

  async copyFile() {
    const packageObj = this.core.service.package || {};
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


  public getTsCodeRoot () {
    const tmpOutDir = resolve(this.defaultTmpFaaSOut, 'src');
    if (existsSync(tmpOutDir)) {
      return tmpOutDir;
    } else {
      return this.codeAnalyzeResult.tsCodeRoot;
    }
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

    // 获取要分析的代码目录
    this.analyzedTsCodeRoot = this.getTsCodeRoot();
    // 扫描文件查看是否发生变化，乳沟没有变化就跳过编译
    const directoryToScan: string = relative(this.baseDir, this.analyzedTsCodeRoot);

    const isTsMode = checkIsTsMode();
    if (isTsMode) {
      process.env.MIDWAY_TS_MODE = 'true';
      return;
    }
    const { lockType } = getLock(this.buildLockPath);
    this.core.debug('lockType', lockType);
    // 如果当前存在构建任务，那么就进行等待
    if (lockType === LOCK_TYPE.INITIAL) {
      setLock(this.buildLockPath, LOCK_TYPE.WAITING);
    } else if (lockType === LOCK_TYPE.WAITING) {
      await waitForLock(this.buildLockPath);
    }

    const specFile = this.core.config.specFile.path;
    // 只有当非首次调用时才会进行增量分析，其他情况均进行全量分析
    if (existsSync(buildLockPath)) {
      this.core.debug('buildLockPath', buildLockPath);
      this.fileChanges = await compareFileChange(
        [specFile, `${directoryToScan}/**/*`],
        [buildLockPath],
        { cwd: this.baseDir }
      );
      if (!this.fileChanges || !this.fileChanges.length) {
        this.getAnaLysisCodeInfo();
        setLock(this.buildLockPath, LOCK_TYPE.COMPLETE);
        this.skipTsBuild = true;
        this.setStore('skipTsBuild', true);
        this.core.debug('Auto skip ts compile');
        return;
      }
    } else {
      this.fileChanges = [`${directoryToScan}/**/*`];
      // 如果没有构建锁，但是存在代码分析，这时候认为上一次是获取了函数列表
      // if (existsSync(this.analysisCodeInfoPath)) {
      //   this.getAnaLysisCodeInfo();
      // }
    }
    this.core.debug('fileChanges', this.fileChanges);
    setLock(this.buildLockPath, LOCK_TYPE.WAITING);
  }

  async compile() {
    // 如果在代码分析中止，那么可以从store中获取function信息
    this.setStore('functions', this.core.service.functions);

    // 如果跳过了ts编译，那么也就是说曾经编译过，那么也跳过代码分析
    if (this.skipTsBuild) {
      return;
    }

    const dest = join(this.buildDir, 'dist');
    const { config } = resolveTsConfigFile(
      this.baseDir,
      dest,
      undefined,
      this.getStore('mwccHintConfig', 'global'),
      {
        include: this.fileChanges,
        compilerOptions: {
          incremental: this.options.incremental,
          rootDir: this.analyzedTsCodeRoot,
        },
      }
    );
    this.compilerHost = new CompilerHost(this.baseDir, config);
    this.program = new Program(this.compilerHost);

    // 当spec上面没有functions的时候，启动代码分析
    if (!this.core.service.functions) {
      const analyzeInstance = new Analyzer({
        program: this.program,
        decoratorLowerCase: true
      });
      const analyzeResult = analyzeInstance.analyze();
      const newSpec = await analysisResultToSpec(analyzeResult);
      this.core.debug('Code Analysis Result', newSpec);
      this.core.service.functions = newSpec.functions;
      this.setStore('functions', this.core.service.functions);
      writeFileSync(
        this.analysisCodeInfoPath,
        JSON.stringify(newSpec.functions)
      );
    }
    if (this.core.pluginManager.options.stopLifecycle === 'invoke:compile') {
      // LOCK_TYPE.INITIAL 是因为跳过了ts编译，下一次来的时候还是得进行ts编译
      setLock(this.buildLockPath, LOCK_TYPE.INITIAL);
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

  async emit() {
    const isTsMode = checkIsTsMode();
    if (isTsMode || this.skipTsBuild) {
      return;
    }

    this.core.debug('emit', this.codeAnalyzeResult);
    try {
      this.program.emit();

      const dest = join(this.buildDir, 'dist');
      if (!existsSync(dest)) {
        mkdirSync(dest);
      }
    } catch (e) {
      await remove(this.buildLockPath);
      setLock(this.buildLockPath, LOCK_TYPE.COMPLETE);
      this.core.debug('Typescript Build Error', e);
      throw new Error('Typescript Build Error, Please Check Your FaaS Code!');
    }
    setLock(this.buildLockPath, LOCK_TYPE.COMPLETE);
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
      const isTsMode = checkIsTsMode();
      const starterName = this.getStarterName();
      if (!starterName) {
        return;
      }

      writeWrapper({
        baseDir: this.baseDir,
        service: {
          layers: this.core.service.layers,
          functions: this.core.service.functions,
        },
        faasModName: process.env.MidwayModuleName,
        distDir: this.buildDir,
        starter: getPlatformPath(starterName),
        loadDirectory: isTsMode
          ? [getPlatformPath(resolve(this.defaultTmpFaaSOut, 'src'))]
          : [],
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

  getStarterName() {
    const platform = this.getPlatform();
    this.core.debug('Platform entry', platform);
    if (platform === 'aliyun') {
      return require.resolve('@midwayjs/serverless-fc-starter');
    } else if (platform === 'tencent') {
      return require.resolve('@midwayjs/serverless-scf-starter');
    }
  }

  async getInvoke() {
    let handler;
    let initHandler;
    let runtime;
    let invoke;
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
        const trigger = await this.getTriggerInfo(args);
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

  async getTriggerInfo(args) {
    const platform = this.getPlatform();
    let triggerMap;
    if (platform === 'aliyun') {
      triggerMap = FCTrigger;
    } else if (platform === 'tencent') {
      triggerMap = SCFTrigger;
    }
    return this.getTrigger(triggerMap, args);
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
    return provider;
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
}
