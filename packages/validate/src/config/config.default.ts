import { ValidateOptions } from '../decorator/validate';

export const validate: ValidateOptions = {
  validationOptions: {},
  errorStatus: 422,
};

export const i18n = {
  localeTable: {
    en_US: {
      validate: require('../../locales/en_US.json'),
    },
    zh_CN: {
      validate: require('../../locales/zh_CN.json'),
    },
  },
};
