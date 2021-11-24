import { Init, Config, Provide, Scope, ScopeEnum } from '@midwayjs/decorator';
import { TranslateOptions } from './interface';
import { MidwayCommonError, safelyGet } from '@midwayjs/core';
import { formatWithArray, formatWithObject } from './utils';

@Provide()
@Scope(ScopeEnum.Singleton)
export class MidwayI18nService {
  @Config('i18n')
  i18nConfig;

  private languageTextMap: Map<string, Record<string, string>> = new Map();
  private defaultLanguage: string;

  @Init()
  async init() {
    this.defaultLanguage = this.i18nConfig.defaultLanguage;
    for (const lang in this.i18nConfig.languageTable) {
      this.addLanguage(lang, getES6Object(this.i18nConfig.languageTable[lang]));
    }
  }

  addLanguage(lang: string, langTextMapping: Record<string, string>) {
    if (!this.languageTextMap.has(lang)) {
      this.languageTextMap.set(lang, {});
    }
    const currentMap = this.languageTextMap.get(lang);
    for (const key in langTextMapping) {
      currentMap[key] = langTextMapping[key];
    }
  }

  translate(message: string, options: TranslateOptions = {}) {
    const useLang = options.lang ?? this.defaultLanguage;
    const args = options.args ?? [];
    const langMap = this.languageTextMap.get(useLang);
    if (langMap) {
      const msg = safelyGet(message, langMap);
      if (msg) {
        return formatText(msg, args);
      } else {
        // fallback
        const fallbackLanguage = this.i18nConfig.fallbackLanguage;
        const fallbackMap = this.languageTextMap.get(fallbackLanguage);
        const msg = safelyGet(message, fallbackMap);
        if (msg) {
          return formatText(msg, args);
        }
      }
    } else {
      throw new MidwayCommonError(`Language ${useLang} mapping not found`);
    }
  }
}

function formatText(message, args) {
  if (Array.isArray(args)) {
    return formatWithArray(message, args);
  } else {
    return formatWithObject(message, args);
  }
}

function getES6Object(o) {
  for (const key in o) {
    if (o[key]['default'] && Object.keys(o[key]).length === 1) {
      o[key] = o[key].default;
    }
  }
  return o;
}
