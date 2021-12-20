import * as passport from 'passport';

export * from './dist/index';

declare module '@midwayjs/core/dist/interface' {
  interface MidwayConfig {
    passport?: passport.AuthenticateOptions;
  }
}

declare module '@midwayjs/koa/dist/interface' {
  interface Context {
    isAuthenticated(): boolean;
    isUnauthenticated(): boolean;
    login(): Promise<void>;
    logout(): void;
  }
}
