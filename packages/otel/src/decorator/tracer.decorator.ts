import { createCustomMethodDecorator } from '@midwayjs/core';

export const TRACE_KEY = 'decorator:open_telemetry_key';

export function Trace(spanName: string): MethodDecorator {
  return createCustomMethodDecorator(TRACE_KEY, {
    spanName,
  });
}
