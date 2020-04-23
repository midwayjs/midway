import { CommandHookCore, loadSpec, getSpecFile } from '@midwayjs/fcli-command-core';
import { FaaSInvokePlugin } from './index';

export interface InvokeOptions {
  functionDir?: string; // 函数所在目录
  functionName: string; // 函数名
  data?: any[]; // 函数入参
  trigger?: string; // 触发器
  handler?: string;
  sourceDir?: string; // 一体化目录结构下，函数的目录，比如 src/apis，这个影响到编译
  clean?: boolean; // 清理调试目录
  incremental?: boolean; // 增量编译
  verbose?: boolean | string; // 输出更多信息
}

export const getFunction = (getOptions) => {
  return async (options: any) => {
    const baseDir = options.functionDir || process.cwd();
    const specFile = getSpecFile(baseDir);
    const core = new CommandHookCore({
      config: {
        servicePath: baseDir,
        specFile
      },
      commands: ['invoke'],
      service: loadSpec(baseDir, specFile),
      provider: '',
      options: {
        function: options.functionName,
        data: options.data,
        trigger: options.trigger,
        handler: options.handler,
        sourceDir: options.sourceDir,
        clean: options.clean,
        incremental: options.incremental,
        verbose: options.verbose,
        resultType: 'store'
      },
      log: console,
      stopLifecycle: getOptions.stopLifecycle
    });
    core.addPlugin(FaaSInvokePlugin);
    await core.ready();
    await core.invoke(['invoke']);
    return core.store.get('FaaSInvokePlugin:' + getOptions.key);
  }
}

export async function invoke (options: InvokeOptions) {
  const invokeFun = getFunction({
    key: 'result'
  });
  const result = await invokeFun(options);
  if (result.success) {
    return result.result;
  } else {
    throw result.err;
  }
}


export interface IGetFuncList {
  functionDir?: string; // 函数所在目录
  sourceDir?: string; // 一体化目录结构下，函数的目录，比如 src/apis，这个影响到编译
  verbose?: boolean; // 输出更多信息
}
export async function getFuncList (options: IGetFuncList) {
  const invokeFun = getFunction({
    stopLifecycle: 'invoke:analysisCode',
    key: 'functions'
  });
  return invokeFun(options);
}
