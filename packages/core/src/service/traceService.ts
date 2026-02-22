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
import {
  Config,
  Init,
  Inject,
  Logger,
  MainApp,
  Provide,
  Scope,
} from '../decorator';
import {
  ILogger,
  IMidwayApplication,
  JoinPoint,
  ScopeEnum,
  TraceMetaRecord,
  TraceMetaResolver,
  TraceMetaResolverArgs,
} from '../interface';
import { TRACE_KEY } from '../decorator/common/tracer';
import { MidwayDecoratorService } from './decoratorService';

@Provide()
@Scope(ScopeEnum.Singleton)
export class MidwayTraceService {
  private currentTracerName = 'midway';
  private tracingConfig: {
    enable?: boolean;
    onError?: 'throw' | 'ignore';
    logOnError?: boolean;
  };

  @MainApp()
  protected app: IMidwayApplication;

  @Inject()
  protected decoratorService: MidwayDecoratorService;

  @Config('tracing')
  protected tracingOptions: {
    enable?: boolean;
    onError?: 'throw' | 'ignore';
    logOnError?: boolean;
  };

  @Logger('coreLogger')
  protected logger: ILogger;

  @Init()
  protected init() {
    this.currentTracerName = this.app?.getProjectName?.() ?? 'unknown_project';
    this.tracingConfig = {
      enable: true,
      onError: 'ignore',
      logOnError: false,
      ...(this.tracingOptions ?? {}),
    };

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

  private getProtocolFromAttributes(attributes?: Record<string, any>) {
    const protocol = attributes?.['midway.protocol'];
    if (!protocol || typeof protocol !== 'string') {
      return 'default';
    }
    return protocol;
  }

  private isProtocolEnabled() {
    return this.tracingConfig?.enable !== false;
  }

  private handleTraceError(err: unknown, phase: string) {
    if (this.tracingConfig?.logOnError) {
      this.logger?.warn?.(
        `[midway:trace] ${phase} failed: ${(err as Error)?.message || err}`
      );
    }
    if (this.tracingConfig?.onError === 'throw') {
      throw err;
    }
  }

  private pickTraceMetaValue(meta: unknown): TraceMetaRecord {
    if (!meta || typeof meta !== 'object') {
      return {};
    }
    const result: TraceMetaRecord = {};
    for (const [key, value] of Object.entries(meta)) {
      if (value === null || value === undefined) {
        continue;
      }
      if (
        typeof value === 'string' ||
        typeof value === 'number' ||
        typeof value === 'boolean'
      ) {
        result[key] = value;
      }
    }
    return result;
  }

  resolveTraceMeta(
    resolver: TraceMetaResolver | undefined,
    args: TraceMetaResolverArgs
  ): TraceMetaRecord {
    if (!resolver) {
      return {};
    }

    const mergeMeta = (
      target: TraceMetaRecord,
      source:
        | TraceMetaRecord
        | ((args: TraceMetaResolverArgs) => TraceMetaRecord)
        | undefined
    ) => {
      if (!source) {
        return;
      }
      const resolved =
        typeof source === 'function'
          ? source(args)
          : (source as TraceMetaRecord);
      Object.assign(target, this.pickTraceMetaValue(resolved));
    };

    if (typeof resolver === 'function') {
      return this.pickTraceMetaValue(resolver(args));
    }

    const resolverWithDirection = resolver as {
      common?:
        | TraceMetaRecord
        | ((args: TraceMetaResolverArgs) => TraceMetaRecord);
      entry?:
        | TraceMetaRecord
        | ((args: TraceMetaResolverArgs) => TraceMetaRecord);
      exit?:
        | TraceMetaRecord
        | ((args: TraceMetaResolverArgs) => TraceMetaRecord);
    };
    if (
      resolverWithDirection.common !== undefined ||
      resolverWithDirection.entry !== undefined ||
      resolverWithDirection.exit !== undefined
    ) {
      const result: TraceMetaRecord = {};
      mergeMeta(result, resolverWithDirection.common);
      mergeMeta(result, resolverWithDirection[args.direction]);
      return result;
    }

    return this.pickTraceMetaValue(resolver as TraceMetaRecord);
  }

  runWithEntrySpan<T = unknown>(
    name: string,
    options: {
      enable?: boolean;
      carrier?: any;
      responseCarrier?: any;
      getter?: TextMapGetter<any>;
      setter?: TextMapSetter<any>;
      kind?: SpanKind;
      attributes?: Record<string, any>;
      meta?: TraceMetaResolver;
      metaArgs?: Omit<
        TraceMetaResolverArgs,
        'direction' | 'protocol' | 'spanName'
      >;
    },
    callback: (span: Span) => Promise<T> | T
  ): Promise<T> {
    const protocol = this.getProtocolFromAttributes(options.attributes);
    const traceMeta = this.resolveTraceMeta(options.meta, {
      direction: 'entry',
      protocol,
      spanName: name,
      ...(options.metaArgs ?? {}),
    });
    const spanAttributes = {
      ...(options.attributes ?? {}),
      ...traceMeta,
    };

    if (!this.isProtocolEnabled() || options.enable === false) {
      return Promise.resolve(callback(undefined as unknown as Span));
    }

    const getter = options.getter ?? this.defaultGetter;
    const setter = options.setter ?? this.defaultSetter;
    let parentContext = context.active();
    if (options.carrier) {
      try {
        parentContext = propagation.extract(
          context.active(),
          options.carrier,
          getter
        );
      } catch (err) {
        this.handleTraceError(err, 'extract entry context');
      }
    }

    return trace.getTracer(this.currentTracerName).startActiveSpan(
      name,
      {
        kind: options.kind ?? SpanKind.SERVER,
        attributes: spanAttributes,
      },
      parentContext,
      async span => {
        try {
          const result = await callback(span);
          span.setStatus({
            code: SpanStatusCode.OK,
          });
          if (options.responseCarrier) {
            try {
              propagation.inject(
                context.active(),
                options.responseCarrier,
                setter
              );
            } catch (err) {
              this.handleTraceError(err, 'inject entry response context');
            }
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
      enable?: boolean;
      carrier?: any;
      getter?: TextMapGetter<any>;
      setter?: TextMapSetter<any>;
      kind?: SpanKind;
      attributes?: Record<string, any>;
      meta?: TraceMetaResolver;
      metaArgs?: Omit<
        TraceMetaResolverArgs,
        'direction' | 'protocol' | 'spanName'
      >;
    },
    callback: (span: Span) => Promise<T> | T
  ): Promise<T> {
    const protocol = this.getProtocolFromAttributes(options.attributes);
    const traceMeta = this.resolveTraceMeta(options.meta, {
      direction: 'exit',
      protocol,
      spanName: name,
      ...(options.metaArgs ?? {}),
    });
    const spanAttributes = {
      ...(options.attributes ?? {}),
      ...traceMeta,
    };

    if (!this.isProtocolEnabled() || options.enable === false) {
      return Promise.resolve(callback(undefined as unknown as Span));
    }

    const setter = options.setter ?? this.defaultSetter;
    const carrier = options.carrier ?? {};

    return trace.getTracer(this.currentTracerName).startActiveSpan(
      name,
      {
        kind: options.kind ?? SpanKind.CLIENT,
        attributes: spanAttributes,
      },
      async span => {
        try {
          try {
            propagation.inject(context.active(), carrier, setter);
          } catch (err) {
            this.handleTraceError(err, 'inject exit context');
          }
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
    try {
      propagation.inject(
        context.active(),
        carrier,
        setter ?? this.defaultSetter
      );
    } catch (err) {
      this.handleTraceError(err, 'inject context');
    }
    return carrier;
  }
}
