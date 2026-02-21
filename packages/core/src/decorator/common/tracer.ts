import { DecoratorManager } from '../decoratorManager';

/**
 * Internal metadata key for trace method decorator.
 */
export const TRACE_KEY = 'decorator:open_telemetry_key';

/**
 * Mark a method to create an OpenTelemetry span for its invocation.
 */
export function Trace(spanName: string): MethodDecorator {
  return DecoratorManager.createCustomMethodDecorator(TRACE_KEY, {
    spanName,
  });
}
