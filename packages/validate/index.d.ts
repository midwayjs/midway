export * from './dist/index';
import * as Joi from 'joi';

declare module '@midwayjs/core' {
  interface MidwayConfig {
    validate?: {
      validationOptions?: Joi.ValidationOptions;
      errorStatus?: number;
    };
  }
}
