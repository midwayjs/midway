import {
  CommandHookCore,
  loadSpec,
  getSpecFile,
} from '@midwayjs/fcli-command-core';
import { FaaSInvokePlugin } from './index';
import { formatInvokeResult, optionsToInvokeParams } from './utils';
import { InvokeOptions } from './interface';
import { HooksPlugin } from '@midwayjs/fcli-plugin-hooks';
const { debugWrapper } = require('@midwayjs/debugger');

export const getFunction = (getOptions: any = {}) => {
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
      options: optionsToInvokeParams(options),
      log: console,
      stopLifecycle: getOptions.stopLifecycle,
    });
    core.addPlugin(FaaSInvokePlugin);
    core.addPlugin(HooksPlugin);
    await core.ready();
    await core.invoke(['invoke']);

    return {
      core,
      getResult: key => {
        return core.store.get('FaaSInvokePlugin:' + key);
      },
    };
  };
};

export async function invokeFun(options: InvokeOptions) {
  const invokeFun = getFunction({
    stopLifecycle: options.getFunctionList
      ? 'invoke:setFunctionList'
      : undefined,
  });
  const { core, getResult } = await invokeFun(options);

  if (!options.getFunctionList) {
    const result = getResult('result');
    return formatInvokeResult(result);
  }

  return {
    functionList: getResult('functions'),
    invoke: async (options: InvokeOptions) => {
      await core.resume(optionsToInvokeParams(options));
      const result = getResult('result');
      return formatInvokeResult(result);
    },
  };
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
    stopLifecycle: 'invoke:setFunctionList',
    specFile,
    spec,
  });
  options.clean = false;
  options.incremental = true;
  const { getResult } = await invokeFun(options);
  return getResult('functions');
}
