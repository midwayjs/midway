import {
  Init,
  Provide,
  Scope,
  ScopeEnum,
  Config,
  Inject,
} from '@midwayjs/decorator';
import { I18N_ATTR_KEY, I18N_SAVE_KEY, TranslateOptions } from './interface';
import * as pm from 'picomatch';
import { I18nOptions } from './interface';
import { formatWithArray, formatWithObject } from './utils';
import { IMidwayContext } from '@midwayjs/core';

@Provide()
@Scope(ScopeEnum.Singleton)
export class MidwayI18nServiceSingleton {
  @Config('i18n')
  private i18nConfig: I18nOptions;

  private localeTextMap: Map<string, Map<string, any>> = new Map();
  private defaultLocale: string;
  private fallbackMatch: Array<{
    pattern: any;
    locale: string;
  }> = [];
  private localeMatchCache = {};

  @Init()
  protected async init() {
    this.defaultLocale = this.i18nConfig.defaultLocale;
    for (const lang in this.i18nConfig.localeTable) {
      this.addLocale(lang, getES6Object(this.i18nConfig.localeTable[lang]));
    }
    // fallbacks
    for (const rule in this.i18nConfig.fallbacks) {
      this.fallbackMatch.push({
        pattern: pm(rule),
        locale: this.i18nConfig.fallbacks[rule],
      });
    }
  }

  /**
   * add a language text mapping
   * @param locale
   * @param localeTextMapping
   */
  public addLocale(locale: string, localeTextMapping: Record<string, any>) {
    const currentLangMap = getMap(this.localeTextMap, locale);

    for (const key in localeTextMapping) {
      if (typeof localeTextMapping[key] === 'string') {
        // set to default
        getMap(currentLangMap, 'default').set(key, localeTextMapping[key]);
      } else {
        // set to group
        for (const newKey in localeTextMapping[key]) {
          getMap(currentLangMap, key).set(
            newKey,
            localeTextMapping[key][newKey]
          );
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
    const useLocale = options.locale ?? this.defaultLocale;
    const args = options.args ?? [];
    const group = options.group ?? 'default';

    let msg = this.getLocaleMappingText(useLocale, message, group, args);
    if (!msg && useLocale !== this.defaultLocale) {
      if (this.fallbackMatch.length) {
        const findRule = this.fallbackMatch.find(rule => {
          if (rule.pattern(useLocale)) {
            return true;
          }
        });
        if (findRule) {
          msg = this.getLocaleMappingText(
            findRule.locale,
            message,
            group,
            args
          );
        }
      }

      if (!msg) {
        const fallbackLanguage = this.i18nConfig.fallbackLocale;
        if (fallbackLanguage) {
          msg = this.getLocaleMappingText(
            fallbackLanguage,
            message,
            group,
            args
          );
        }
      }
    }
    return msg;
  }

  /**
   * get locale string by find fallback and default, ignore match message
   * @param locale
   * @param group
   */
  public getAvailableLocale(locale: string, group = 'default') {
    if (this.localeMatchCache[locale + '_' + group]) {
      return this.localeMatchCache[locale + '_' + group];
    }
    if (
      this.localeTextMap.has(locale) &&
      this.localeTextMap.get(locale).has(group)
    ) {
      this.localeMatchCache[locale + '_' + group] = locale;
      return locale;
    }

    if (this.fallbackMatch.length) {
      const findRule = this.fallbackMatch.find(rule => {
        if (rule.pattern(locale)) {
          if (
            this.localeTextMap.has(rule.locale) &&
            this.localeTextMap.get(locale).has(group)
          ) {
            this.localeMatchCache[locale + '_' + group] = rule.locale;
            return rule.locale;
          }
          return true;
        }
      });
      return findRule.locale;
    }

    const fallbackLanguage = this.i18nConfig.fallbackLocale;
    if (
      this.localeTextMap.has(fallbackLanguage) &&
      this.localeTextMap.get(fallbackLanguage).has(group)
    ) {
      this.localeMatchCache[locale + '_' + group] = fallbackLanguage;
      return fallbackLanguage;
    }

    this.localeMatchCache[locale + '_' + group] = this.defaultLocale;
    return this.defaultLocale;
  }

  /**
   * get mapping by lang
   * @param locale
   * @param group
   */
  public getLocaleMapping(locale: string, group = 'default') {
    const langMap = this.localeTextMap.get(locale);
    if (langMap) {
      return langMap.get(group);
    }
  }

  /**
   * get current default language
   */
  public getDefaultLocale() {
    return this.defaultLocale;
  }

  private getLocaleMappingText(locale: string, message, group, args) {
    const langMap = this.localeTextMap.get(locale);
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

@Provide()
export class MidwayI18nService {
  @Inject()
  protected i18nServiceSingleton: MidwayI18nServiceSingleton;

  @Inject()
  ctx: IMidwayContext;

  public translate(message: string, options: TranslateOptions = {}) {
    if (!options.locale) {
      options.locale = this.ctx.getAttr && this.ctx.getAttr(I18N_ATTR_KEY);
    }
    return this.i18nServiceSingleton.translate(message, options);
  }

  /**
   * add a language text mapping
   * @param locale
   * @param localeTextMapping
   */
  public addLocale(locale: string, localeTextMapping: Record<string, any>) {
    this.i18nServiceSingleton.addLocale(locale, localeTextMapping);
  }

  /**
   * get mapping by lang
   * @param locale
   * @param group
   */
  public getLocaleMapping(locale, group) {
    return this.i18nServiceSingleton.getLocaleMapping(locale, group);
  }

  /**
   * get current default language
   */
  public getDefaultLocale() {
    return this.i18nServiceSingleton.getDefaultLocale();
  }

  /**
   * save current context lang to flag, middleware will be set it to cookie
   */
  public saveLocale() {
    const currentLocale =
      this.ctx.getAttr(I18N_ATTR_KEY) ?? this.getDefaultLocale();
    this.ctx?.setAttr(I18N_SAVE_KEY, currentLocale);
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
