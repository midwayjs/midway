import { SessionOptions, ISession } from './dist';
export * from './dist/index';

declare module '@midwayjs/core' {
  interface MidwayConfig {
    session?: PowerPartial<SessionOptions>;
  }
}

declare module '@midwayjs/koa' {
  interface Context {
    session?: ISession;
  }
}

declare module '@midwayjs/faas' {
  interface Context {
    session?: ISession;
  }
}
