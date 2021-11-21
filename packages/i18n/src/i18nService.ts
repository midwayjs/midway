import { Init, Config, Provide, Scope, ScopeEnum } from '@midwayjs/decorator';
import { TranslateOptions } from './interface';
import { MidwayCommonError } from '@midwayjs/core';
import { format } from 'util';

@Provide()
@Scope(ScopeEnum.Singleton)
export class MidwayI18nService {
  @Config('i18n')
  i18nConfig;

  private localeTextMap: Map<string, Map<string, string>> = new Map();
  private currentLocale: string;

  @Init()
  async init() {
    this.currentLocale = this.i18nConfig.currentLocale;
  }

  addLocale(lang: string, langTextMapping: Record<string, string>) {
    if (!this.localeTextMap.has(lang)) {
      this.localeTextMap.set(lang, new Map());
    }
    const currentMap = this.localeTextMap.get(lang);
    for (const key in langTextMapping) {
      currentMap.set(key, langTextMapping[key]);
    }
  }

  translate(message: string, options: TranslateOptions) {
    const useLang = options.lang ?? this.currentLocale;
    const langMap = this.localeTextMap.get(useLang);
    if (langMap && langMap.has(message)) {
      return format(langMap.get(message), options.args);
    } else {
      throw new MidwayCommonError('locale mapping not found');
    }
  }
}
