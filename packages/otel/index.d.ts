export * from './dist/index';

declare module '@midwayjs/core/dist/interface' {
  interface MidwayConfig {
    otel?: Record<string, any>;
  }
}

declare module '@midwayjs/koa/dist/interface' {
  interface Context {
    traceId: string;
  }
}

declare module '@midwayjs/web/dist/interface' {
  interface Context {
    traceId: string;
  }
}
