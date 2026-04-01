export * from './dist/index';
export { default } from './dist/index';
import { ValidatorOptions } from 'class-validator';

declare module '@midwayjs/core' {
  interface MidwayConfig {
    classValidator?: ValidatorOptions;
  }
}
