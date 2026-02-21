import {
  context,
  propagation,
  Span,
  SpanKind,
  SpanStatusCode,
  TextMapGetter,
  TextMapSetter,
  trace,
} from '@opentelemetry/api';
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

  private readonly defaultGetter: TextMapGetter<any> = {
    get(carrier, key) {
      if (!carrier || !key) {
        return undefined;
      }
      if (typeof carrier.get === 'function') {
        return carrier.get(key);
      }
      const lowerKey = key.toLowerCase();
      const realKey = Object.keys(carrier).find(
        item => item.toLowerCase() === lowerKey
      );
      return realKey ? carrier[realKey] : undefined;
    },
    keys(carrier) {
      if (!carrier) {
        return [];
      }
      return Object.keys(carrier);
    },
  };

  private readonly defaultSetter: TextMapSetter<any> = {
    set(carrier, key, value) {
      if (!carrier || !key) {
        return;
      }
      if (typeof carrier.setHeader === 'function') {
        carrier.setHeader(key, value);
        return;
      }
      if (typeof carrier.set === 'function') {
        carrier.set(key, value);
        return;
      }
      carrier[key] = value;
    },
  };

  runWithEntrySpan<T = unknown>(
    name: string,
    options: {
      carrier?: any;
      responseCarrier?: any;
      getter?: TextMapGetter<any>;
      setter?: TextMapSetter<any>;
      kind?: SpanKind;
      attributes?: Record<string, any>;
    },
    callback: (span: Span) => Promise<T> | T
  ): Promise<T> {
    const getter = options.getter ?? this.defaultGetter;
    const setter = options.setter ?? this.defaultSetter;
    const parentContext = options.carrier
      ? propagation.extract(context.active(), options.carrier, getter)
      : context.active();

    return trace.getTracer(this.currentTracerName).startActiveSpan(
      name,
      {
        kind: options.kind ?? SpanKind.SERVER,
        attributes: options.attributes,
      },
      parentContext,
      async span => {
        try {
          const result = await callback(span);
          span.setStatus({
            code: SpanStatusCode.OK,
          });
          if (options.responseCarrier) {
            propagation.inject(context.active(), options.responseCarrier, setter);
          }
          return result;
        } catch (err) {
          span.setStatus({
            code: SpanStatusCode.ERROR,
          });
          span.recordException(err as Error);
          throw err;
        } finally {
          span.end();
        }
      }
    ) as Promise<T>;
  }

  runWithExitSpan<T = unknown>(
    name: string,
    options: {
      carrier?: any;
      getter?: TextMapGetter<any>;
      setter?: TextMapSetter<any>;
      kind?: SpanKind;
      attributes?: Record<string, any>;
    },
    callback: (span: Span) => Promise<T> | T
  ): Promise<T> {
    const setter = options.setter ?? this.defaultSetter;
    const carrier = options.carrier ?? {};

    return trace.getTracer(this.currentTracerName).startActiveSpan(
      name,
      {
        kind: options.kind ?? SpanKind.CLIENT,
        attributes: options.attributes,
      },
      async span => {
        try {
          propagation.inject(context.active(), carrier, setter);
          const result = await callback(span);
          span.setStatus({
            code: SpanStatusCode.OK,
          });
          return result;
        } catch (err) {
          span.setStatus({
            code: SpanStatusCode.ERROR,
          });
          span.recordException(err as Error);
          throw err;
        } finally {
          span.end();
        }
      }
    ) as Promise<T>;
  }

  injectContext(carrier: any, setter?: TextMapSetter<any>) {
    propagation.inject(context.active(), carrier, setter ?? this.defaultSetter);
    return carrier;
  }
}
