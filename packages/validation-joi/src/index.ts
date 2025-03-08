import {
  IMidwayContainer,
  MidwayConfigService,
  MetadataManager,
} from '@midwayjs/core';
import * as Joi from 'joi';
import {
  getRuleMeta,
  ValidateResult,
  ValidationExtendOptions,
  IValidationService,
  RULES_KEY,
} from '@midwayjs/validation';
import { MidwayI18nServiceSingleton } from '@midwayjs/i18n';

const localeMapping = new Map();

export default {
  validateServiceHandler: (container: IMidwayContainer) => {
    const configService = container.get(MidwayConfigService);

    // add default language support
    configService.addObject({
      i18n: {
        localeTable: {
          en_US: {
            joi: require('../locales/en_US.json'),
          },
          zh_CN: {
            joi: require('../locales/zh_CN.json'),
          },
        },
      },
    });

    return new (class implements IValidationService<any> {
      defaultValidatorOptions: Joi.ValidationOptions;
      async init() {
        const i18nServiceSingleton = await container.getAsync(
          MidwayI18nServiceSingleton
        );

        // get user configuration and merge with default configuration
        for (const locale of i18nServiceSingleton.getLocaleList('joi')) {
          localeMapping.set(
            locale,
            i18nServiceSingleton.getOriginLocaleJSON(locale, 'joi')
          );
        }

        this.defaultValidatorOptions = configService.getConfiguration('joi');
      }
      public validateWithSchema(
        schema: Joi.ObjectSchema<any>,
        value: any,
        options: ValidationExtendOptions,
        validatorOptions: any = {}
      ): ValidateResult {
        // get locale from options or fallback to default
        const locale = localeMapping.has(options.locale)
          ? options.locale
          : localeMapping.has(options.fallbackLocale)
          ? options.fallbackLocale
          : 'en-us';

        // merge to new validator options
        const newValidatorOptions = {
          errors: {
            language: locale,
          },
          messages: localeMapping.get(locale),
          ...this.defaultValidatorOptions,
          ...validatorOptions,
        };

        // validate the value
        const result = schema.validate(value, newValidatorOptions);

        if (result.error) {
          return {
            status: false,
            error: result.error,
            errors: [result.error],
            message: result.error.message,
            messages: [result.error.message],
          };
        } else {
          return {
            status: true,
            value: result.value,
          };
        }
      }
    })();
  },
  schemaHelper: {
    isRequired: (ClzType: any, propertyName: string): boolean => {
      const schemas = getRuleMeta(ClzType);
      const schema = schemas[propertyName];
      const description = schema?.describe();
      // 只有明确设置为 required 才返回 true
      return description?.flags?.presence === 'required';
    },
    isOptional: (ClzType: any, propertyName: string): boolean => {
      const schemas = getRuleMeta(ClzType);
      const schema = schemas[propertyName];
      const description = schema?.describe();
      // 如果没有 presence 标记或标记为 optional，都认为是可选的
      return (
        !description?.flags?.presence ||
        description?.flags?.presence === 'optional'
      );
    },
    setRequired: (ClzType: any, propertyName?: string): void => {
      const schemas = getRuleMeta(ClzType);
      if (propertyName) {
        // 处理单个属性
        const schema = schemas[propertyName];
        if (schema) {
          const newSchema = schema.required();
          MetadataManager.defineMetadata(
            RULES_KEY,
            newSchema,
            ClzType,
            propertyName
          );
        }
      } else {
        // 处理所有属性
        Object.entries(schemas).forEach(([key, schema]) => {
          if (schema) {
            const newSchema = schema.required();
            MetadataManager.defineMetadata(RULES_KEY, newSchema, ClzType, key);
          }
        });
      }
    },
    setOptional: (ClzType: any, propertyName?: string): void => {
      const schemas = getRuleMeta(ClzType);
      if (propertyName) {
        // 处理单个属性
        const schema = schemas[propertyName];
        if (schema) {
          const newSchema = schema.optional();
          MetadataManager.defineMetadata(
            RULES_KEY,
            newSchema,
            ClzType,
            propertyName
          );
        }
      } else {
        // 处理所有属性
        Object.entries(schemas).forEach(([key, schema]) => {
          if (schema) {
            const newSchema = schema.optional();
            MetadataManager.defineMetadata(RULES_KEY, newSchema, ClzType, key);
          }
        });
      }
    },
    getSchema: (ClzType: any): Joi.ObjectSchema<any> => {
      return Joi.object(getRuleMeta(ClzType));
    },
    getIntSchema: (): Joi.NumberSchema<any> => {
      return Joi.number().integer().required();
    },
    getBoolSchema: (): Joi.BooleanSchema<any> => {
      return Joi.boolean().required();
    },
    getFloatSchema: (): Joi.NumberSchema<any> => {
      return Joi.number().required();
    },
    getStringSchema: (): Joi.StringSchema<any> => {
      return Joi.string().required();
    },
  },
};
