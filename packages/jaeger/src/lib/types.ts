import { TracingConfig } from 'jaeger-client';

export interface TracerConfig {
  /** 请求路径忽略名单 */
  whiteList: (string | RegExp)[];
  /**
   * 强制采样请求处理时间（毫秒）阈值
   * 负数不采样
   */
  reqThrottleMsForPriority: number;
  tracingConfig: TracingConfig;
  /**
   * Used to `app.config.coreMiddleware.unshift('tracerMiddleware')`
   *
   * @default 'tracerMiddleware' for ./middleware/tracer.middleware.ts
   */
  middleWareName: string;
}

export interface SpanHeaderInit {
  [HeadersKey.traceId]: string;
}
export interface SpanLogInput {
  [key: string]: unknown;
}

export enum HeadersKey {
  /**
   * format: {trace-id}:{span-id}:{parent-span-id}:{flags}
   */
  traceId = 'uber-trace-id',
  reqId = 'x-request-id',
}

export enum TracerTag {
  dbName = 'db',
  dbClient = 'db.client',
  dbHost = 'db.host',
  dbDatabase = 'db.database',
  dbPort = 'db.port',
  dbUser = 'db.user',
  dbCommand = 'db.command',
  callerClass = 'caller.class',
  reqId = 'reqId',
  svcIp4 = 'svc.ipv4',
  svcIp6 = 'svc.ipv6',
  svcName = 'svc.name',
  svcVer = 'svc.ver',
  resCode = 'res.code',
  message = 'message',
  reqQuery = 'req.query',
  reqBody = 'req.body',
  respBody = 'resp.body',
}

export enum TracerLog {
  error = 'error',
  requestBegin = 'tracer-request-begin',
  requestEnd = 'tracer-request-end',

  fetchStart = 'fetch-start',
  fetchFinish = 'fetch-finish',

  queryResponse = 'query-response',
  queryError = 'error',
  queryStart = 'query-start',
  queryFinish = 'query-finish',
  queryRowCount = 'row-count',
  queryCost = 'query-cost',
  queryCostThottleInSec = 'query-cost-thottle-in-sec',

  resMsg = 'res.msg',
  errMsg = 'err.msg',
  errStack = 'err.stack',
}
