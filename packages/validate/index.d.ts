export * from './dist/index';
import * as Joi from 'joi';

declare module '@midwayjs/core/dist/interface' {
  interface MidwayConfig {
    validate?: {
      validationOptions?: Joi.ValidationOptions;
      errorStatus?: number;
    };
  }
}
