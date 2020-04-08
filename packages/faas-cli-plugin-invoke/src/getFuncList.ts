import { CommandHookCore, loadSpec, getSpecFile } from '@midwayjs/fcli-command-core';
import { FaaSInvokePlugin } from './index';

export interface IGetFuncList {
  functionDir?: string; // 函数所在目录
  sourceDir?: string; // 一体化目录结构下，函数的目录，比如 src/apis，这个影响到编译
  verbose?: boolean; // 输出更多信息
}

export async function getFuncList (options: IGetFuncList) {
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
      sourceDir: options.sourceDir,
      verbose: options.verbose,
      resultType: 'store'
    },
    log: console,
    stopLifecycle: 'invoke:analysisCode'
  });
  core.addPlugin(FaaSInvokePlugin);
  await core.ready();
  await core.invoke(['invoke']);
  const result = core.store.get('FaaSInvokePlugin:functions');
  return result;
}
