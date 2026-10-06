import joi from '@midwayjs/validation-joi';

export default {
  koa: {
    keys: '123456',
    port: 7001,
  },
  validation: {
    validators: {
      joi,
    },
    defaultValidator: 'joi',
  },
};
