import { IMidwayWebContext } from '@midwayjs/web';
import { Tags } from 'opentracing';

import { SpanLogInput, TracerLog, TracerTag } from '../lib/types';
import { retrieveExternalNetWorkInfo } from '../util/common';
import { TracerManager } from '../lib/tracer';

const netInfo = retrieveExternalNetWorkInfo()

export function updateSpan(ctx: IMidwayWebContext): void {
  const { tracerManager } = ctx

  ctx.reqId && tracerManager.setSpanTag(TracerTag.reqId, ctx.reqId);
  tracerManager.setSpanTag(Tags.HTTP_METHOD, ctx.req.method ?? 'n/a');

  const pkg = ctx.app.getConfig('pkg');
  tracerManager.setSpanTag(TracerTag.svcName, pkg.name);
  if (pkg.version) {
    tracerManager.setSpanTag(TracerTag.svcVer, pkg.version);
  }

  netInfo.forEach(ipInfo => {
    if (ipInfo.family === 'IPv4') {
      tracerManager.setSpanTag(TracerTag.svcIp4, ipInfo.cidr);
    }
    // else {
    //   tracerManager.setSpanTag(TracerTag.svcIp6, ipInfo.cidr)
    // }
  });

  tracerManager.setSpanTag(Tags.PEER_HOST_IPV4, ctx.request.ip);
}


export function logError(trm: TracerManager, err: Error): void {
  const input: SpanLogInput = {
    event: TracerLog.error,
  };

  // ctx._internalError in error-handler.middleware.ts
  if (err instanceof Error) {
    input[TracerLog.resMsg] = err.message;
    const { stack } = err;
    if (stack) {
      // udp limit 65k
      // @link https://www.jaegertracing.io/docs/1.22/client-libraries/#emsgsize-and-udp-buffer-limits
      input[TracerLog.errStack] = stack.slice(0, 20000);
    }
  }

  trm.spanLog(input);
}
