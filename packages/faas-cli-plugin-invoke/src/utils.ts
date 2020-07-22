import { existsSync, remove } from 'fs-extra';
import { join } from 'path';
export const exportMidwayFaaS = (() => {
  const midwayModuleName = process.env.MidwayModuleName || '@midwayjs/faas';
  const faasPath = join(process.cwd(), './node_modules/', midwayModuleName);
  if (existsSync(faasPath)) {
    return require(faasPath);
  } else {
    try {
      return require(midwayModuleName);
    } catch (e) {
      return { FaaSStarter: class DefaulltMidwayFaasStarter {} };
    }
  }
})();

export const FaaSStarterClass = exportMidwayFaaS.FaaSStarter;

export const cleanTarget = async (p: string) => {
  if (existsSync(p)) {
    await remove(p);
  }
};


export const formatInvokeResult = (result) => {
  if (result.success) {
    return result.result;
  } else {
    throw result.err;
  }
}



export interface InvokeOptions {
  functionDir?: string; // 函数所在目录
  functionName?: string; // 函数名
  data?: any[]; // 函数入参
  trigger?: string; // 触发器
  handler?: string;
  sourceDir?: string; // 一体化目录结构下，函数的目录，比如 src/apis，这个影响到编译
  clean?: boolean; // 清理调试目录
  incremental?: boolean; // 增量编译
  verbose?: boolean | string; // 输出更多信息
  getFunctionList?: boolean; // 获取函数列表
}

export const optionsToInvokeParams = (options: InvokeOptions) => {
  return {
    function: options.functionName,
    data: options.data,
    trigger: options.trigger,
    handler: options.handler,
    sourceDir: options.sourceDir,
    clean: options.clean,
    incremental: options.incremental,
    verbose: options.verbose,
    resultType: 'store',
  };
}