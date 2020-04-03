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
  verbose?: boolean; // 输出更多信息
}

export async function invoke (options: InvokeOptions) {
  const baseDir = options.functionDir;
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
    pluginType: 'local'
  });
  core.addPlugin(FaaSInvokePlugin);
  await core.ready();
  await core.invoke(['invoke']);
  const result = core.store.get('FaaSInvokePlugin:result');
  if (result.success) {
    return result.result;
  } else {
    throw result.err;
  }
}
