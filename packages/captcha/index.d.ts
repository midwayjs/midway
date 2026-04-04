import { CaptchaOptions } from './dist/index';
export * from './dist/index';

declare module '@midwayjs/core' {
  interface MidwayConfig {
    captcha?: Partial<CaptchaOptions>;
  }
}
