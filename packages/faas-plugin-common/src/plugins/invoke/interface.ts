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
