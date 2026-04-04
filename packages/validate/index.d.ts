import '@midwayjs/i18n';
import * as Joi from 'joi';
export * from './dist/index';

declare module '@midwayjs/core' {
  interface MidwayConfig {
    validate?: {
      validationOptions?: Joi.ValidationOptions;
      errorStatus?: number;
    };
  }
}
