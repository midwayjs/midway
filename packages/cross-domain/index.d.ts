import { CORSOptions, JSONPOptions } from './dist/index';
export * from './dist/index';

declare module '@midwayjs/core/dist/interface' {
  interface MidwayConfig {
    cors?: Partial<CORSOptions>;
    jsonp?: Partial<JSONPOptions>;
  }
}

declare module '@midwayjs/koa/dist/interface' {
  interface Context {
    jsonp: (body: any, config?: JSONPOptions) => string;
  }
}

declare module '@midwayjs/web/dist/interface' {
  interface Context {
    jsonp: (body: any, config?: JSONPOptions) => string;
  }
}

declare module '@midwayjs/faas/dist/interface' {
  interface Context {
    jsonp: (body: any, config?: JSONPOptions) => string;
  }
}

declare module '@midwayjs/express/dist/interface' {
  interface Context {
    jsonp: (body: any, config?: JSONPOptions) => string;
  }
}
