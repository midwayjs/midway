import { ValidatorOptions } from 'class-validator';

export * from './dist/index';
declare const classValidator: typeof import('./dist/index').default;
export default classValidator;

declare module '@midwayjs/core' {
  interface MidwayConfig {
    classValidator?: ValidatorOptions;
  }
}
