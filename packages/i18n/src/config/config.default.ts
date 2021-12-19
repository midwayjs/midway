import { I18nOptions } from '../interface';
import { FORMAT } from '@midwayjs/decorator';

export const i18n: I18nOptions = {
  defaultLocale: 'en_US',
  localeTable: {
    en_US: {},
  },
  fallbackLocale: 'en_US',
  fallbacks: {
    //   'en_*': 'en_US',
    //   pt: 'pt-BR',
  },
  writeCookie: true,
  resolver: {
    queryField: 'locale',
    cookieField: {
      fieldName: 'locale',
      cookieDomain: '',
      cookieMaxAge: FORMAT.MS.ONE_YEAR,
    },
  },
};
