export * from './interface';
export { MidwayWebFramework as Framework } from './framework';
export {
  createEggApplication,
  createEggAgent,
  createAppWorkerLoader,
  createAgentWorkerLoader,
} from './application';
// must export mock app here
export { Application, Agent } from './application';

/**
 * @deprecated
 */
import { IWebMiddleware } from './interface';
export type WebMiddleware = IWebMiddleware;
export { MidwayWebMiddleware as Middleware } from './interface';
export type KoaMiddleware<T = any> = (
  context: T,
  next: () => Promise<any>
) => void;
export { providerWrapper } from '@midwayjs/core';
/**
 * @deprecated
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
