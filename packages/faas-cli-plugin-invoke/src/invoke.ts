import {
  CommandHookCore,
  loadSpec,
  getSpecFile,
} from '@midwayjs/fcli-command-core';
import { FaaSInvokePlugin } from './index';
const { debugWrapper } = require('@midwayjs/debugger');

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

export const getFunction = (getOptions: any = {})=> {
  return async (options: any) => {
    const baseDir = options.functionDir || process.cwd();
    const specFile = getOptions.specFile || getSpecFile(baseDir);
    const core = new CommandHookCore({
      config: {
        servicePath: baseDir,
        specFile,
      },
      commands: ['invoke'],
      service: getOptions.spec || loadSpec(baseDir, specFile),
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
        resultType: 'store',
      },
      log: console,
      stopLifecycle: getOptions.stopLifecycle,
    });
    core.addPlugin(FaaSInvokePlugin);
    await core.ready();
    await core.invoke(['invoke']);
    
    return {
      core,
      getResult: (key) => {
        return core.store.get('FaaSInvokePlugin:' + key);
      }
    }
  };
};

export async function invokeFun(options: InvokeOptions) {
  const invokeFun = getFunction();
  const { getResult } = await invokeFun(options);
  const result = getResult('result');
  if (result.success) {
    return result.result;
  } else {
    throw result.err;
  }
}

export async function invoke(options: InvokeOptions) {
  const isDebug = process.env.MIDWAY_FAAS_DEBUG;
  return debugWrapper({
    file: __filename, // 要包裹的方法所在文件
    export: 'invokeFun', // 要包裹的方法的方法名
    debug: isDebug,
  })(options);
}

export interface IGetFuncList {
  functionDir?: string; // 函数所在目录
  sourceDir?: string; // 一体化目录结构下，函数的目录，比如 src/apis，这个影响到编译
  verbose?: boolean; // 输出更多信息
  [key: string]: any;
}
export async function getFuncList(options: IGetFuncList) {
  const baseDir = options.functionDir || process.cwd();
  const specFile = getSpecFile(baseDir);
  const spec = loadSpec(baseDir, specFile);
  // 如果spec中有functions，就不走代码分析
  if (spec.functions) {
    return spec.functions;
  }
  const invokeFun = getFunction({
    stopLifecycle: 'invoke:compile',
    specFile,
    spec,  
  });
  options.clean = false;
  options.incremental = true;
  const { core, getResult } = await invokeFun(options);
  return {
    funcList: getResult('functions'),
    invoke: async () => {
      await core.resume();
      return getResult('result');
    }
  }
}

