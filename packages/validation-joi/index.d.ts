export * from './dist/index';
import * as Joi from 'joi';

declare module '@midwayjs/core/dist/interface' {
  interface MidwayConfig {
    joi?: Joi.ValidationOptions;
  }
}
