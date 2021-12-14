export interface TranslateOptions {
  locale?: string;
  group?: string;
  args?: any;
}

export interface I18nOptions {
  defaultLocale: string;
  localeTable: Record<string, Record<string, any>>;
  fallbackLocale: string;
  fallbacks: Record<string, any>;
  resolver: {
    queryField: string;
    headerField: string;
    cookieField: string;
    cookieDomain: string;
    cookieMaxAge: string;
  }
}

export const I18N_ATTR_KEY = 'i18n:locale';
export const I18N_SAVE_KEY = 'i18n:need_save_locale';
