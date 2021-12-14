import { I18nOptions } from '../interface';

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
  resolver: {
    queryField: 'locale',
    headerField: 'locale',
    cookieField: 'locale',
    cookieDomain: '',
    cookieMaxAge: '1y',
  },
};
