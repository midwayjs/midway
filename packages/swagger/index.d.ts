import { SwaggerOptions } from './dist/index';
export * from './dist/index';

declare module '@midwayjs/core' {
  interface MidwayConfig {
    swagger?: Partial<SwaggerOptions>;
  }
}
