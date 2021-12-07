import * as passport from 'passport';

export * from './dist/index';

declare module '@midwayjs/core/dist/interface' {
  interface MidwayConfig {
    passport?: passport.AuthenticateOptions;
  }
}
