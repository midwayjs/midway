import { SessionOptions, ISession } from './dist';
export * from './dist/index';

declare module '@midwayjs/core/dist/interface' {
  interface MidwayConfig {
    session?: PowerPartial<SessionOptions>;
  }
}

declare module '@midwayjs/koa/dist/interface' {
  interface Context {
    session?: ISession;
  }
}

declare module '@midwayjs/faas/dist/interface' {
  interface Context {
    session?: ISession;
  }
}
