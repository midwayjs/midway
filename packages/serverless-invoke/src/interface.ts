export interface InvokeOptions {
  functionDir?: string; // 函数所在目录
  functionName: string; // 函数名
  debug?: string; // debug 端口
  isDebug?: boolean; // 是否采用debug
  data?: any[]; // 函数入参
  log?: boolean; // 是否进行console输出
  trigger?: string; // 触发器
  provider?: string; // 部署的环境
  debugCb?: any;
  providerEventMap?: any;
  starter?: any;
  eventPath?: string;
  eventName?: string;
  layers?: any;
  handler?: string;
  midwayModuleName?: string;
  sourceDir?: string; // 一体化目录结构下，函数的目录，比如 src/apis，这个影响到编译
  clean?: boolean; // 清理调试目录
  incremental?: boolean; // 增量编译
  verbose?: boolean; // 输出更多信息
}

export interface IInvoke {
  invoke(...args: any);
}
