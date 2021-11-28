import { Init, Provide, Scope, ScopeEnum } from '@midwayjs/decorator';
import { BasicTracerProvider } from '@opentelemetry/sdk-trace-base';
import { trace, Tracer, SpanOptions, Context, Span } from '@opentelemetry/api';
import { IMidwayContainer } from '../interface';

@Provide()
@Scope(ScopeEnum.Singleton)
export class MidwayTracingService implements Tracer {
  private globalTracer: Tracer;

  constructor(readonly applicationContext: IMidwayContainer) {}

  @Init()
  protected async init() {
    new BasicTracerProvider().register();
    this.globalTracer = trace.getTracer('default');
  }

  startSpan(name: string, options?: SpanOptions, context?: Context): Span {
    return this.globalTracer.startSpan(name, options, context);
  }

  startActiveSpan<F extends (span: Span) => unknown>(
    name: string,
    fn: F
  ): ReturnType<F>;
  startActiveSpan<F extends (span: Span) => unknown>(
    name: string,
    options: SpanOptions,
    fn: F
  ): ReturnType<F>;
  startActiveSpan<F extends (span: Span) => unknown>(
    name: string,
    options: SpanOptions,
    context: Context,
    fn: F
  ): ReturnType<F>;
  startActiveSpan(name: any, options: any, context?: any, fn?: any): any {
    return this.globalTracer.startActiveSpan(name, options, context, fn);
  }
}
