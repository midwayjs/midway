export interface TranslateOptions {
  locale?: string;
  group?: string;
  args?: any;
}

export interface RequestResolver {
  queryField: string;
  cookieField: {
    fieldName: string;
    cookieDomain: string;
    cookieMaxAge: number;
  };
}

export interface I18nOptions {
  defaultLocale: string;
  localeTable: Record<string, Record<string, any>>;
  fallbacks: Record<string, any>;
  writeCookie: boolean;
  resolver:  RequestResolver | false,
  localsField: string;
}

export const I18N_ATTR_KEY = 'i18n:locale';
