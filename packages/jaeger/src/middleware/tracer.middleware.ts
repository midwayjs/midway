import { Provide } from '@midwayjs/decorator';
import {
  IMidwayWebContext,
  IMidwayWebNext,
  IWebMiddleware,
  MidwayWebMiddleware,
} from '@midwayjs/web';
import { globalTracer, Tags, FORMAT_HTTP_HEADERS } from 'opentracing';

import { TracerManager } from '../lib/tracer';
import { TracerConfig, TracerLog, TracerTag } from '../lib/types';
import { pathMatched } from '../util/common';

import { logError } from './helper';

@Provide()
export class TracerMiddleware implements IWebMiddleware {
  resolve(): MidwayWebMiddleware {
    return tracerMiddleware;
  }
}

/**
 * 链路追踪中间件
 * - 对不在白名单内的路由进行追踪
 * - 对异常链路进行上报
 */
export async function tracerMiddleware(
  ctx: IMidwayWebContext<JsonResp | string>,
  next: IMidwayWebNext
): Promise<unknown> {
  if (ctx.tracerManager) {
    return next();
  }

  // 白名单内的路由不会被追踪
  if (pathMatched(ctx.path, ctx.app.config.tracer.whiteList)) {
    ctx.tracerManager = new TracerManager(false);
    return next();
  }
  startSpan(ctx);
  // 设置异常链路一定会采样
  ctx.res.once('finish', () => finishSpan(ctx));

  return next();
}

function startSpan(ctx: IMidwayWebContext<JsonResp | string>): void {
  // 开启第一个span并入栈
  const tracerManager = new TracerManager(true);
  const requestSpanCtx =
    globalTracer().extract(FORMAT_HTTP_HEADERS, ctx.headers) ?? undefined;

  tracerManager.startSpan(ctx.path, requestSpanCtx);
  tracerManager.spanLog({ event: TracerLog.requestBegin });

  ctx.tracerManager = tracerManager;
}

function finishSpan(ctx: IMidwayWebContext<JsonResp | string>) {
  const { tracerManager } = ctx;
  const { status } = ctx.response;
  const tracerConfig = ctx.app.config.tracer;

  if (status >= 400) {
    if (status === 404) {
      tracerManager.setSpanTag(Tags.SAMPLING_PRIORITY, 1);
    } else {
      tracerManager.setSpanTag(Tags.SAMPLING_PRIORITY, 90);
    }

    tracerManager.setSpanTag(Tags.ERROR, true);
    if (!tracerConfig.enableCatchError && ctx._internalError) {
      logError(tracerManager, ctx._internalError);
    }
  } else {
    processCustomFailure(ctx, tracerManager);
    const opts: ProcessPriorityOpts = {
      starttime: ctx.starttime,
      trm: tracerManager,
      tracerConfig,
    };
    processPriority(opts);
  }

  // [Tag] 请求参数和响应数据
  if (tracerConfig.isLogginInputQuery) {
    if (ctx.method === 'GET') {
      const { query } = ctx.request
      if (typeof query === 'string' && query
        || typeof query === 'object' && Object.keys(query).length
      ) {
        tracerManager.setSpanTag(TracerTag.reqQuery, query)
      }
    }
    else if (ctx.method === 'POST' && ctx.request.type === 'application/json') {
      const { query: body } = ctx.request
      if (typeof body === 'string' && body
        || typeof body === 'object' && Object.keys(body).length
      ) {
        tracerManager.setSpanTag(TracerTag.reqBody, body)
      }
    }
  }
  if (tracerConfig.isLoggingOutputBody) {
    tracerManager.setSpanTag(TracerTag.respBody, ctx.body);
  }
  // [Tag] HTTP状态码
  tracerManager.setSpanTag(Tags.HTTP_STATUS_CODE, status);
  // 结束span
  tracerManager.spanLog({ event: TracerLog.requestEnd });
  tracerManager.finishSpan();
}

function processCustomFailure(
  ctx: IMidwayWebContext<JsonResp | string>,
  trm: TracerManager
): void {
  const { body } = ctx;
  const tracerConfig = ctx.app.config.tracer;

  if (typeof body === 'object') {
    if (typeof body.code !== 'undefined' && body.code !== 0) {
      trm.setSpanTag(Tags.SAMPLING_PRIORITY, 30);
      trm.setSpanTag(TracerTag.resCode, body.code);
      if (!tracerConfig.enableCatchError && ctx._internalError) {
        logError(trm, ctx._internalError);
      }
    }
  }
}

export interface ProcessPriorityOpts {
  starttime: number;
  trm: TracerManager;
  tracerConfig: TracerConfig;
}
function processPriority(options: ProcessPriorityOpts): number | undefined {
  const { starttime, trm } = options;
  const { reqThrottleMsForPriority: throttleMs } = options.tracerConfig;

  if (throttleMs < 0) {
    return;
  }

  const cost = new Date().getTime() - starttime;
  if (cost >= throttleMs) {
    trm.setSpanTag(Tags.SAMPLING_PRIORITY, 11);
  }
  return cost;
}


export type JsonResp<T = never> = {
  /** 0: no error */
  code: number;
  /**
   * keyof typeof ErrorCode, eg. 'E_Not_Found'
   */
  codeKey?: string;
  msg?: string | null;
  /** Request id */
  reqId?: string;
} & ([T] extends [never] ? {
  /** payload */
  dat?: unknown;
} : {
  /** payload */
  dat: T;
});
