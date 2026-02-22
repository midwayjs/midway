import {
  IMidwayContainer,
  MetadataManager,
  MidwayConfigService,
  loadModule,
  MidwayEnvironmentService,
} from '@midwayjs/core';
import {
  getRuleMeta,
  IValidationService,
  RULES_KEY,
  ValidateResult,
  ValidationExtendOptions,
} from '@midwayjs/validation';
import { z } from 'zod';
import { fromError } from 'zod-validation-error';
import * as i18next from 'i18next';
import { MidwayI18nServiceSingleton } from '@midwayjs/i18n';
import { makeZodI18nMap } from '@semihbou/zod-i18n-map';

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

function getZodTypeName(schema: any): string | undefined {
  if (!schema || !schema._def) {
    return;
  }
  return schema._def.typeName || schema._def.type;
}

function unwrapZodSchema(schema: any): any {
  let currentSchema = schema;
  let guard = 0;
  while (currentSchema && guard++ < 12) {
    const typeName = getZodTypeName(currentSchema);
    if (!typeName) {
      return currentSchema;
    }

    if (typeName === 'ZodOptional' || typeName === 'ZodNullable') {
      currentSchema =
        currentSchema._def?.innerType || currentSchema._def?.type || currentSchema;
      continue;
    }

    if (
      typeName === 'ZodDefault' ||
      typeName === 'ZodCatch' ||
      typeName === 'ZodReadonly' ||
      typeName === 'ZodBranded'
    ) {
      currentSchema =
        currentSchema._def?.innerType || currentSchema._def?.type || currentSchema;
      continue;
    }

    if (typeName === 'ZodEffects' || typeName === 'ZodPipeline') {
      currentSchema =
        currentSchema._def?.schema ||
        currentSchema._def?.in ||
        currentSchema._def?.innerType ||
        currentSchema;
      continue;
    }

    return currentSchema;
  }
  return currentSchema;
}

function isZodOptionalSchema(schema: any): boolean {
  if (!schema) {
    return false;
  }
  if (typeof schema.isOptional === 'function') {
    try {
      if (schema.isOptional()) {
        return true;
      }
    } catch {
      // ignore and fallback to type-name based inference
    }
  }

  const typeName = getZodTypeName(schema);
  if (!typeName) {
    return false;
  }

  if (
    typeName === 'ZodOptional' ||
    typeName === 'ZodDefault' ||
    typeName === 'ZodCatch'
  ) {
    return true;
  }

  if (
    typeName === 'ZodEffects' ||
    typeName === 'ZodPipeline' ||
    typeName === 'ZodBranded' ||
    typeName === 'ZodReadonly'
  ) {
    const nestedSchema =
      schema?._def?.schema || schema?._def?.in || schema?._def?.innerType;
    return isZodOptionalSchema(nestedSchema);
  }

  return false;
}

function inferZodSwaggerPropertyMetadata(schema: any): Record<string, any> | null {
  const typeName = getZodTypeName(schema);
  if (!typeName) {
    return null;
  }

  const metadata: Record<string, any> = {};
  metadata.required = !isZodOptionalSchema(schema);

  const unwrappedSchema = unwrapZodSchema(schema);
  const unwrappedType = getZodTypeName(unwrappedSchema);
  switch (unwrappedType) {
    case 'ZodString':
      metadata.type = 'string';
      break;
    case 'ZodNumber':
      metadata.type = 'number';
      break;
    case 'ZodBoolean':
      metadata.type = 'boolean';
      break;
    case 'ZodDate':
      metadata.type = 'string';
      metadata.format = 'date-time';
      break;
    case 'ZodArray': {
      metadata.type = 'array';
      const itemSchema =
        unwrappedSchema?._def?.type || unwrappedSchema?._def?.itemType;
      const itemMetadata = inferZodSwaggerPropertyMetadata(itemSchema);
      if (itemMetadata) {
        const { required: _required, ...other } = itemMetadata;
        metadata.items = other;
      } else {
        metadata.items = { type: 'object' };
      }
      break;
    }
    case 'ZodObject':
      metadata.type = 'object';
      break;
    case 'ZodEnum':
      metadata.type = 'string';
      if (Array.isArray(unwrappedSchema?._def?.values)) {
        metadata.enum = unwrappedSchema._def.values;
      }
      break;
    case 'ZodNativeEnum':
      metadata.type = 'string';
      if (unwrappedSchema?._def?.values) {
        metadata.enum = Object.values(unwrappedSchema._def.values).filter(
          item => ['string', 'number'].includes(typeof item)
        );
      }
      break;
    default:
      metadata.type = 'object';
      break;
  }

  return metadata;
}

export default {
  validateServiceHandler: async (container: IMidwayContainer) => {
    const environmentService = container.get(MidwayEnvironmentService);
    const en = await loadModule('@semihbou/zod-i18n-map/locales/en/zod.json', {
      loadMode: environmentService.getModuleLoadType(),
    });
    const cn = await loadModule(
      '@semihbou/zod-i18n-map/locales/zh-CN/zod.json',
      {
        loadMode: environmentService.getModuleLoadType(),
      }
    );
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
      defaultZodOptions: any;

      async init(container: IMidwayContainer) {
        const i18nServiceSingleton = await container.getAsync(
          MidwayI18nServiceSingleton
        );
        const configService = await container.getAsync(MidwayConfigService);
        this.defaultZodOptions = configService.getConfiguration('zod');

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
          // 使用已初始化的 instance 的 t 方法，namespace 为 'zod'
          localeMapping.set(
            locale,
            makeZodI18nMap({ t: instance.t.bind(instance), ns: 'zod' })
          );
        }
      }

      validateWithSchema(
        schema: z.ZodType,
        value: any,
        options: ValidationExtendOptions,
        validatorOptions: any = {}
      ) {
        const res = {} as ValidateResult;
        const locale = localeMapping.has(options.locale)
          ? options.locale
          : localeMapping.has(options.fallbackLocale)
            ? options.fallbackLocale
            : 'en-us';
        const newValidatorOptions = {
          error: localeMapping.get(locale),
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

    getSchema(ClzType: any): z.ZodType {
      const ruleMetas = getRuleMeta(ClzType);
      // 确保所有的 schema 都是最新的
      const processedMetas = {};
      for (const [key, schema] of Object.entries(ruleMetas)) {
        processedMetas[key] = schema;
      }
      return z.object(processedMetas);
    },

    getIntSchema(): z.ZodType {
      return z.number().int();
    },

    getBoolSchema(): z.ZodType {
      return z.boolean();
    },

    getFloatSchema(): z.ZodType {
      return z.number();
    },

    getStringSchema(): z.ZodType {
      return z.string();
    },
    getSwaggerPropertyKeys: (ClzType: any): string[] => {
      const schemas = getRuleMeta(ClzType);
      return Object.keys(schemas);
    },
    getSwaggerPropertyMetadata: (ClzType: any, propertyName: string) => {
      const schemas = getRuleMeta(ClzType);
      return inferZodSwaggerPropertyMetadata(schemas[propertyName]);
    },
  },
};
