import { Provide } from '@midwayjs/decorator';
import {
  IMidwayWebContext,
  IMidwayWebNext,
  IWebMiddleware,
  MidwayWebMiddleware,
} from '@midwayjs/web';
import { Tags } from 'opentracing';

import { TracerLog } from '../lib/types';
import { pathMatched } from '../util/common';
import { logError, updateSpan } from './helper';

@Provide()
export class TracerExtMiddleware implements IWebMiddleware {
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
  ctx: IMidwayWebContext,
  next: IMidwayWebNext
): Promise<unknown> {
  const { tracerManager } = ctx;
  if (!tracerManager) {
    return next();
  }
  // 白名单内的路由不会被追踪
  else if (pathMatched(ctx.path, ctx.app.config.tracer.whiteList)) {
    return next();
  }

  updateSpan(ctx);

  tracerManager.spanLog({ event: TracerLog.preProcessFinish });

  if (ctx.app.config.tracer.enableCatchError) {
    try {
      await next();
      tracerManager.spanLog({ event: TracerLog.postProcessBegin });
    } catch (ex) {
      tracerManager.setSpanTag(Tags.ERROR, true);
      logError(tracerManager, ex as Error);
      throw ex;
    }
  } else {
    await next();
    tracerManager.spanLog({ event: TracerLog.postProcessBegin });
  }
}
