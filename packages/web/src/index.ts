export * from './interface';
export { MidwayDevFramework as Framework } from './devFramework';
export { MidwayWebFramework } from './framework';
export {
  createEggApplication,
  createEggAgent,
  createAppWorkerLoader,
  createAgentWorkerLoader,
} from './base';
// must export mock app here
export { Application, Agent } from './application';

import { IWebMiddleware, MidwayWebMiddleware } from './interface';
import { providerWrapper as OriginProviderWrapper } from '@midwayjs/core';
/**
 * @deprecated Please use IWebMiddleware instead
 */
export type WebMiddleware = IWebMiddleware;
/**
 * @deprecated Please use MidwayWebMiddleware instead
 */
export type Middleware = MidwayWebMiddleware;
/**
 * @deprecated Please use MidwayWebMiddleware instead
 */
export type KoaMiddleware<T = any> = (
  context: T,
  next: () => Promise<any>
) => void;
/**
 * @deprecated Please import from @midwayjs/core
 */
export const providerWrapper = OriginProviderWrapper;
/**
 * @deprecated Please import from @midwayjs/decorator
 */
export {
  Provide as provide,
  Inject as inject,
  Async as async,
  Init as init,
  Destroy as destroy,
  Scope as scope,
  Autowire as autowire,
  Priority as priority,
  Schedule as schedule,
  Config as config,
  Logger as logger,
  Plugin as plugin,
  Controller as controller,
  Session as session,
  Body as body,
  Query as query,
  Param as param,
  Headers as headers,
  File as file,
  Files as files,
  Post as post,
  Get as get,
  Del as del,
  Put as put,
  Patch as patch,
  Options as options,
  Head as head,
  All as all,
  ControllerOption,
  ScheduleOpts,
  ScopeEnum,
  CommonSchedule,
} from '@midwayjs/decorator';

/**
 * @deprecated
 */
export {
  Context,
  IContextLocals,
  EggEnvType,
  IEggPluginItem,
  EggPlugin,
  PowerPartial,
  EggAppConfig,
  FileStream,
  IApplicationLocals,
  EggApplication,
  EggAppInfo,
  EggHttpClient,
  EggContextHttpClient,
  Request,
  Response,
  Router,
  Service,
  Boot,
  IBoot,
  IgnoreOrMatch,
} from 'egg';

/**
 * @deprecated
 */
export {
  LoggerLevel as EggLoggerLevel,
  EggLogger,
  EggLoggers,
  EggContextLogger,
} from 'egg-logger';
