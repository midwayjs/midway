import { Application } from '@midwayjs/web';
import {
  initTracer as initJaegerTracer,
  JaegerTracer,
  TracingConfig,
} from 'jaeger-client';
import {
  FORMAT_HTTP_HEADERS,
  Span,
  SpanContext,
  initGlobalTracer,
  globalTracer,
} from 'opentracing';

import { SpanHeaderInit, SpanLogInput } from './types';

/**
 * 初始化 tracer 单例
 */
export function initTracer(app: Application): JaegerTracer {
  const config: TracingConfig = {
    serviceName: app.config.pkgJson.name,
    ...app.config.tracer.tracingConfig,
  };
  const tracer = initJaegerTracer(config, {});
  initGlobalTracer(tracer);
  return tracer;
}

/**
 * tracer 管理类，需初始化并挂载到ctx
 */
export class TracerManager {
  readonly instanceId = Symbol(new Date().getTime().toString());
  readonly isTraceEnabled: boolean;

  private readonly spans: Span[];

  constructor(isTraceEnabled: boolean) {
    this.isTraceEnabled = isTraceEnabled;
    this.spans = [];
  }

  currentSpan(): Span | undefined {
    return this.spans[this.spans.length - 1];
  }

  @RunIfEnabled
  startSpan(name: string, parentSpan?: Span | SpanContext): void {
    const span = this.genSpan(name, parentSpan);
    this.spans.push(span);
  }

  genSpan(name: string, parentSpan?: Span | SpanContext): Span {
    const span = globalTracer().startSpan(name, {
      childOf: parentSpan ?? this.currentSpan(),
    });
    return span;
  }

  @RunIfEnabled
  finishSpan(): void {
    this.spans.pop()?.finish();
  }

  @RunIfEnabled
  spanLog(keyValuePairs: SpanLogInput): void {
    this.currentSpan()?.log(keyValuePairs);
  }

  @RunIfEnabled
  setSpanTag(key: string, value: unknown): void {
    this.currentSpan()?.setTag(key, value);
  }

  headerOfCurrentSpan(): SpanHeaderInit | undefined {
    const currentSpan = this.currentSpan();
    if (currentSpan) {
      const headerInit = {} as SpanHeaderInit;
      globalTracer().inject(currentSpan, FORMAT_HTTP_HEADERS, headerInit);
      return headerInit;
    }
  }
}

interface TraceMgrPropDescriptor extends PropertyDescriptor {
  isTraceEnabled?: boolean;
}

/**
 * 类方法装饰器
 *  - 链路被启用才执行方法
 * @param _target 目标类
 * @param _propertyKey 函数名
 * @param descriptor 属性描述符
 * @returns
 */
function RunIfEnabled(
  _target: unknown,
  _propertyKey: string,
  descriptor: TraceMgrPropDescriptor
): TraceMgrPropDescriptor {
  const originalMethod = descriptor.value as (...args: unknown[]) => unknown;
  descriptor.value = function (...args: unknown[]): unknown {
    if (this.isTraceEnabled === true) {
      const ret = originalMethod.apply(this, args);
      return ret;
    }
  };
  return descriptor;
}
