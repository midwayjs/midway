export interface IFaaSStarter {
  start(opts?: any);
  handleInvokeWrapper(handlerMapping: string, isDebug?: boolean);
  getApplicationContext();
  getContext(ctx);
}

export type ContextHandler = object | ((ctx: object) => void);

export interface FaaSMockContext {}

export interface MatchPattern {
  [matchText: string]: any;
}

export interface FaasContextMocker {
  getContext(): ContextHandler;
}

export interface MidwayContainer {}

export interface InvokeOptions {
  functionDir?: string; // 函数所在目录
  functionName: string; // 函数名
  debug?: string; // debug 端口
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
}
