import { context, Span, SpanKind, SpanStatusCode, trace } from '@opentelemetry/api';
import { Init, Inject, MainApp, Provide, Scope } from '../decorator';
import { IMidwayApplication, JoinPoint, ScopeEnum } from '../interface';
import { TRACE_KEY } from '../decorator/common/tracer';
import { MidwayDecoratorService } from './decoratorService';

@Provide()
@Scope(ScopeEnum.Singleton)
export class MidwayTraceService {
  private currentTracerName = 'midway';

  @MainApp()
  protected app: IMidwayApplication;

  @Inject()
  protected decoratorService: MidwayDecoratorService;

  @Init()
  protected init() {
    this.currentTracerName = this.app?.getProjectName?.() ?? 'unknown_project';

    this.decoratorService.registerMethodHandler(TRACE_KEY, options => {
      return {
        around: async (joinPoint: JoinPoint) => {
          return this.createSpan(options.metadata['spanName'], async span => {
            try {
              const result = await joinPoint.proceed(...joinPoint.args);
              span.setStatus({
                code: SpanStatusCode.OK,
              });
              span.end();
              return result;
            } catch (err) {
              span.setStatus({
                code: SpanStatusCode.ERROR,
              });
              span.recordException(err as Error);
              span.end();
              throw err;
            }
          });
        },
      };
    });
  }

  private getCurrentSpan() {
    return trace.getSpan(context.active());
  }

  getTraceId() {
    return this.getCurrentSpan()?.spanContext().traceId;
  }

  createSpan(name: string, callback: (span: Span) => unknown) {
    return trace.getTracer(this.currentTracerName).startActiveSpan(
      name,
      {
        kind: SpanKind.CLIENT,
      },
      callback
    );
  }
}
