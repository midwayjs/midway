import { DecoratorManager } from '@midwayjs/core';

export const TRACE_KEY = 'decorator:open_telemetry_key';

export function Trace(spanName: string): MethodDecorator {
  return DecoratorManager.createCustomMethodDecorator(TRACE_KEY, {
    spanName,
  });
}
