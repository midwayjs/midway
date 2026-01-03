export * from './dist/index';
export { default } from './dist/index';
import { ValidatorOptions } from 'class-validator';

declare module '@midwayjs/core/dist/interface' {
  interface MidwayConfig {
    classValidator?: ValidatorOptions;
  }
}
