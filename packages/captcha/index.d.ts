import { CaptchaOptions } from './dist/index';
export * from './dist/index';

declare module '@midwayjs/core/dist/interface' {
  interface MidwayConfig {
    captcha?: Partial<CaptchaOptions>;
  }
}
