export * from './dist/index';
export { default } from './dist/index';
import * as Joi from 'joi';

declare module '@midwayjs/core' {
  interface MidwayConfig {
    joi?: Joi.ValidationOptions;
  }
}
