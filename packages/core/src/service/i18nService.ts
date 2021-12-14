import { Init, Provide, Scope, ScopeEnum, Inject } from '@midwayjs/decorator';
import { formatWithArray, formatWithObject } from '../util';
import { IMidwayContainer, TranslateOptions } from '../interface';
import { MidwayConfigService } from './configService';
import * as pm from 'picomatch';

@Provide()
@Scope(ScopeEnum.Singleton)
export class MidwayI18nService {
  @Inject()
  protected configService: MidwayConfigService;

  private i18nConfig;

  private languageTextMap: Map<string, Map<string, any>> = new Map();
  private defaultLanguage: string;
  private fallbackMatch: Array<{
    pattern: any;
    lang: string;
  }> = [];

  constructor(readonly applicationContext: IMidwayContainer) {}

  @Init()
  protected async init() {
    this.i18nConfig = this.configService.getConfiguration('i18n');
    this.defaultLanguage = this.i18nConfig.defaultLanguage;
    for (const lang in this.i18nConfig.languageTable) {
      this.addLanguage(lang, getES6Object(this.i18nConfig.languageTable[lang]));
    }
    // fallbacks
    for (const rule in this.i18nConfig.fallback) {
      this.fallbackMatch.push({
        pattern: pm(rule),
        lang: this.i18nConfig.fallback[rule],
      });
    }
  }

  /**
   * add a language text mapping
   * @param lang
   * @param langTextMapping
   */
  public addLanguage(lang: string, langTextMapping: Record<string, any>) {
    const currentLangMap = getMap(this.languageTextMap, lang);

    for (const key in langTextMapping) {
      if (typeof langTextMapping[key] === 'string') {
        // set to default
        getMap(currentLangMap, 'default').set(key, langTextMapping[key]);
      } else {
        // set to group
        for (const newKey in langTextMapping[key]) {
          getMap(currentLangMap, key).set(newKey, langTextMapping[key][newKey]);
        }
      }
    }
  }

  /**
   * translate a message
   * @param message
   * @param options
   */
  public translate(message: string, options: TranslateOptions = {}) {
    const useLang = options.lang ?? this.defaultLanguage;
    const args = options.args ?? [];
    const group = options.group ?? 'default';

    let msg = this.getLangMappingText(useLang, message, group, args);
    if (!msg) {
      if (this.fallbackMatch.length) {
        const findRule = this.fallbackMatch.find(rule => {
          if (rule.pattern(useLang)) {
            return true;
          }
        });
        if (findRule) {
          msg = this.getLangMappingText(findRule.lang, message, group, args);
        }
      }

      if (!msg) {
        const fallbackLanguage = this.i18nConfig.fallbackLanguage;
        if (fallbackLanguage) {
          msg = this.getLangMappingText(fallbackLanguage, message, group, args);
        }
      }
    }
    return msg;
  }

  private getLangMappingText(lang, message, group, args) {
    const langMap = this.languageTextMap.get(lang);
    if (langMap) {
      const textMapping = langMap.get(group);
      if (textMapping) {
        const msg = textMapping.get(message);
        if (msg) {
          return formatText(msg, args);
        }
      }
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

function getMap(o: Map<string, any>, key: string) {
  if (!o.has(key)) {
    o.set(key, new Map());
  }
  return o.get(key);
}
