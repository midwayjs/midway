import { Provide } from '@midwayjs/decorator';
import {
  IWebMiddleware,
  IMidwayWebNext,
  MidwayWebMiddleware,
} from '@midwayjs/web';
import type { Context } from 'egg';
import { globalTracer, Tags, FORMAT_HTTP_HEADERS } from 'opentracing';

import { SpanLogInput, TracerConfig, TracerLog, TracerTag } from '../lib/types';
import { retrieveExternalNetWorkInfo } from '../util/common';
import { TracerManager } from '../lib/tracer';

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
async function tracerMiddleware(
  ctx: Context,
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

function startSpan(ctx: Context): void {
  // 开启第一个span并入栈
  const tracerManager = new TracerManager(true);
  const requestSpanCtx =
    globalTracer().extract(FORMAT_HTTP_HEADERS, ctx.headers) ?? undefined;

  tracerManager.startSpan(ctx.path, requestSpanCtx);
  tracerManager.setSpanTag(Tags.HTTP_METHOD, ctx.req.method ?? 'n/a');
  ctx.reqId && tracerManager.setSpanTag(TracerTag.reqId, ctx.reqId);

  const { pkgJson } = ctx.app.config;
  tracerManager.setSpanTag(TracerTag.svcName, pkgJson.name);
  if (pkgJson.version) {
    tracerManager.setSpanTag(TracerTag.svcVer, pkgJson.version);
  }

  retrieveExternalNetWorkInfo().forEach(ipInfo => {
    if (ipInfo.family === 'IPv4') {
      tracerManager.setSpanTag(TracerTag.svcIp4, ipInfo.cidr);
    }
    // else {
    //   tracerManager.setSpanTag(TracerTag.svcIp6, ipInfo.cidr)
    // }
  });

  tracerManager.setSpanTag(Tags.PEER_HOST_IPV4, ctx.request.ip);
  tracerManager.spanLog({ event: TracerLog.requestBegin });

  ctx.tracerManager = tracerManager;
}

function finishSpan(ctx: Context) {
  const { tracerManager } = ctx;
  const { status } = ctx.response;

  if (status >= 400) {
    if (status === 404) {
      tracerManager.setSpanTag(Tags.SAMPLING_PRIORITY, 1);
    } else {
      tracerManager.setSpanTag(Tags.SAMPLING_PRIORITY, 90);
    }

    tracerManager.setSpanTag(Tags.ERROR, true);
    setLogForCustomCode(ctx, tracerManager);
  } else {
    processCustomFailure(ctx, tracerManager);
    const opts: ProcessPriorityOpts = {
      starttime: ctx.starttime,
      trm: tracerManager,
      tracerConfig: ctx.app.config.tracer,
    };
    processPriority(opts);
  }

  // [Tag] 请求参数和响应数据
  if (ctx.method === 'GET') {
    tracerManager.setSpanTag(TracerTag.reqQuery, ctx.request.query);
  }
  if (ctx.method === 'POST' && ctx.request.type === 'application/json') {
    tracerManager.setSpanTag(TracerTag.reqBody, ctx.request.body);
  }
  tracerManager.setSpanTag(TracerTag.respBody, ctx.body);
  // [Tag] HTTP状态码
  tracerManager.setSpanTag(Tags.HTTP_STATUS_CODE, status);
  // 结束span
  tracerManager.spanLog({ event: TracerLog.requestEnd });
  tracerManager.finishSpan();
}

function processCustomFailure(
  ctx: Context<string | Record<string, unknown>>,
  trm: TracerManager
): void {
  const { body } = ctx;

  if (typeof body === 'object') {
    if (typeof body.code !== 'undefined' && body.code !== 0) {
      trm.setSpanTag(Tags.SAMPLING_PRIORITY, 30);
      trm.setSpanTag(TracerTag.resCode, body.code);
      setLogForCustomCode(ctx, trm);
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

function setLogForCustomCode(ctx: Context, trm: TracerManager): void {
  const input: SpanLogInput = {
    event: TracerLog.error,
  };

  // ctx._internalError in error-handler.middleware.ts
  if (ctx._internalError && ctx._internalError instanceof Error) {
    input[TracerLog.resMsg] = ctx._internalError.message;

    const { stack } = ctx._internalError;
    if (stack) {
      // udp limit 65k
      // @link https://www.jaegertracing.io/docs/1.22/client-libraries/#emsgsize-and-udp-buffer-limits
      input[TracerLog.errStack] = stack.slice(0, 50000);
    }
  }

  trm.spanLog(input);
}

function pathMatched(path: string, rules: TracerConfig['whiteList']): boolean {
  const ret = rules.some(rule => {
    if (!rule) {
      return;
    } else if (typeof rule === 'string') {
      return rule === path;
    } else {
      return rule.test(path);
    }
  });
  return ret;
}
