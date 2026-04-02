import * as Joi from 'joi';

export * from './dist/index';
declare const joi: typeof import('./dist/index').default;
export default joi;

declare module '@midwayjs/core' {
  interface MidwayConfig {
    joi?: Joi.ValidationOptions;
  }
}
