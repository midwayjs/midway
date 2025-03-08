import {
  IMidwayContainer,
  MetadataManager,
  MidwayConfigService,
} from '@midwayjs/core';
import {
  getRuleMeta,
  IValidationService,
  RULES_KEY,
  ValidateResult,
  ValidationExtendOptions,
} from '@midwayjs/validation';
import { z, ParseParams } from 'zod';
import { fromError } from 'zod-validation-error';
import * as i18next from 'i18next';
import { makeZodI18nMap } from 'zod-i18n-map';
import * as en from 'zod-i18n-map/locales/en/zod.json';
import * as cn from 'zod-i18n-map/locales/zh-CN/zod.json';
import { MidwayI18nServiceSingleton } from '@midwayjs/i18n';

// 将 i18n 的标准 locale 转换为 zod-i18n-map 提供的 locale
const lngMapping = {
  'ar-eg': 'ar',
  'bg-bg': 'bg',
  'cs-cz': 'cs',
  'de-de': 'de',
  'en-gb': 'en',
  'en-us': 'en',
  'es-es': 'es',
  'fa-ir': 'fa',
  'fi-fi': 'fi',
  'fr-be': 'fr',
  'fr-fr': 'fr',
  'he-il': 'he',
  'hr-hr': 'hr-HR',
  'id-id': 'id',
  'is-is': 'is',
  'it-it': 'it',
  'ja-jp': 'ja',
  'ko-kr': 'ko',
  'nb-no': 'nb',
  'nl-be': 'nl',
  'nl-nl': 'nl',
  'pl-pl': 'pl',
  'pt-br': 'pt',
  'pt-pt': 'pt',
  'ro-ro': 'ro',
  'ru-ru': 'ru',
  'sk-sk': 'sk',
  'sv-se': 'sv',
  'tr-tr': 'tr',
  'uk-ua': 'uk-UA',
  'zh-cn': 'zh-CN',
  'zh-tw': 'zh-TW',
};

const localeMapping = new Map();

export default {
  validateServiceHandler: (container: IMidwayContainer) => {
    const configService = container.get(MidwayConfigService);
    configService.addObject({
      i18n: {
        localeTable: {
          en_US: {
            zod: en,
          },
          zh_CN: {
            zod: cn,
          },
        },
      },
    });
    return new (class implements IValidationService<z.ZodType> {
      defaultZodOptions: z.ParseParams;

      async init(container: IMidwayContainer) {
        const i18nServiceSingleton = await container.getAsync(
          MidwayI18nServiceSingleton
        );
        const configService = await container.getAsync(MidwayConfigService);
        this.defaultZodOptions =
          configService.getConfiguration<z.ParseParams>('zod');

        for (const locale of i18nServiceSingleton.getLocaleList('zod')) {
          const instance = i18next.createInstance();
          const newLocale = lngMapping[locale];
          const cfg = {
            lng: newLocale,
            resources: {
              [newLocale]: {
                zod: i18nServiceSingleton.getOriginLocaleJSON(locale, 'zod'),
              },
            },
          };
          await instance.init(cfg);
          localeMapping.set(locale, makeZodI18nMap(instance));
        }
      }

      validateWithSchema(
        schema: z.ZodType,
        value: any,
        options: ValidationExtendOptions,
        validatorOptions: Partial<ParseParams> = {}
      ) {
        const res = {} as ValidateResult;
        const locale = localeMapping.has(options.locale)
          ? options.locale
          : localeMapping.has(options.fallbackLocale)
          ? options.fallbackLocale
          : 'en-us';
        const newValidatorOptions = {
          errorMap: localeMapping.get(locale),
          ...this.defaultZodOptions,
          ...validatorOptions,
        };

        const { success, data, error } = schema.safeParse(
          value,
          newValidatorOptions
        );
        if (success) {
          res.status = true;
          res.value = data;
        } else {
          res.status = false;
          res.error = error;
          res.errors = [error];
          res.message = fromError(error).toString();
          res.messages = [fromError(error).toString()];
        }
        return res;
      }
    })();
  },
  schemaHelper: {
    isRequired: (ClzType: any, propertyName: string): boolean => {
      const ruleMetas = getRuleMeta(ClzType);
      const schema = ruleMetas[propertyName];
      return schema && !schema.isOptional();
    },

    isOptional: (ClzType: any, propertyName: string): boolean => {
      const ruleMetas = getRuleMeta(ClzType);
      const schema = ruleMetas[propertyName];
      return schema && schema.isOptional();
    },

    setRequired: (ClzType: any, propertyName?: string): void => {
      const ruleMetas = getRuleMeta(ClzType);
      if (propertyName) {
        // 处理单个属性
        const schema = ruleMetas[propertyName];
        if (schema?.isOptional()) {
          // 使用 unwrap() 获取非可选的 schema
          MetadataManager.defineMetadata(
            RULES_KEY,
            schema.unwrap(),
            ClzType,
            propertyName
          );
        }
      } else {
        // 处理所有属性
        Object.entries(ruleMetas).forEach(([key, schema]) => {
          if (schema?.isOptional()) {
            MetadataManager.defineMetadata(
              RULES_KEY,
              schema.unwrap(),
              ClzType,
              key
            );
          }
        });
      }
    },

    setOptional: (ClzType: any, propertyName?: string): void => {
      const ruleMetas = getRuleMeta(ClzType);
      if (propertyName) {
        // 处理单个属性
        const schema = ruleMetas[propertyName];
        if (schema && !schema.isOptional()) {
          // 使用 optional() 创建可选的 schema
          MetadataManager.defineMetadata(
            RULES_KEY,
            schema.optional(),
            ClzType,
            propertyName
          );
        }
      } else {
        // 处理所有属性
        Object.entries(ruleMetas).forEach(([key, schema]) => {
          if (schema && !schema.isOptional()) {
            MetadataManager.defineMetadata(
              RULES_KEY,
              schema.optional(),
              ClzType,
              key
            );
          }
        });
      }
    },

    getSchema(ClzType: any): z.ZodType<any, z.ZodTypeDef, any> {
      const ruleMetas = getRuleMeta(ClzType);
      // 确保所有的 schema 都是最新的
      const processedMetas = {};
      for (const [key, schema] of Object.entries(ruleMetas)) {
        processedMetas[key] = schema;
      }
      return z.object(processedMetas);
    },

    getIntSchema(): z.ZodType<any, z.ZodTypeDef, any> {
      return z.number().int();
    },

    getBoolSchema(): z.ZodType<any, z.ZodTypeDef, any> {
      return z.boolean();
    },

    getFloatSchema(): z.ZodType<any, z.ZodTypeDef, any> {
      return z.number();
    },

    getStringSchema(): z.ZodType<any, z.ZodTypeDef, any> {
      return z.string();
    },
  },
};
