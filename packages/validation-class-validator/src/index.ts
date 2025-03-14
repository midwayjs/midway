import { IMidwayContainer, MidwayConfigService } from '@midwayjs/core';
import {
  IValidationService,
  ValidateResult,
  ValidationExtendOptions,
} from '@midwayjs/validation';
import { plainToInstance } from 'class-transformer';
import {
  validateSync,
  ValidatorOptions,
  getMetadataStorage,
  ValidationMetadata,
  ValidationTypes,
} from 'class-validator-multi-lang-lite';
import { MidwayI18nServiceSingleton } from '@midwayjs/i18n';

const EN_I18N_MESSAGES = require('../i18n/en.json');
const ZH_I18N_MESSAGES = require('../i18n/zh.json');
const localeMapping = new Map();

function isFieldOptional(target: any, propertyKey: string): boolean {
  const metadataStorage = getMetadataStorage();

  // 直接从存储中获取元数据
  const allMetadatas = metadataStorage['validationMetadatas'].get(target) || [];

  // 过滤出当前属性的元数据
  const propertyMetadatas = allMetadatas.filter(
    meta => meta.propertyName === propertyKey
  );

  // 如果没有任何验证规则，则认为是可选的
  if (!propertyMetadatas || propertyMetadatas.length === 0) {
    return true;
  }

  // 检查是否有必需的验证规则
  const hasRequiredRule = propertyMetadatas.some(
    meta =>
      (meta.type === 'customValidation' && meta.name === 'isRequired') ||
      meta.type === 'nestedValidation'
  );

  if (hasRequiredRule) {
    return false;
  }

  // 检查是否有可选的验证规则
  return propertyMetadatas.some(
    meta =>
      meta.type === 'isOptional' ||
      meta.type === 'conditionalValidation' ||
      (meta.type === 'customValidation' && meta.name === 'isOptional')
  );
}

function setPropertyMetadata(
  target: any,
  propertyKey: string,
  isOptional: boolean
): void {
  const metadataStorage = getMetadataStorage();

  // 获取现有的验证元数据
  const existingMetadatas =
    metadataStorage['validationMetadatas'].get(target) || [];

  // 找到所有非 isOptional 和 conditionalValidation 的元数据
  const validationMetadatas = existingMetadatas.filter(
    meta =>
      meta.propertyName === propertyKey &&
      meta.type !== 'isOptional' &&
      meta.type !== 'conditionalValidation'
  );

  // 清除该属性的所有现有元数据
  const newMetadatas = existingMetadatas.filter(
    meta => meta.propertyName !== propertyKey
  );
  metadataStorage['validationMetadatas'].set(target, newMetadatas);

  // 添加基本验证规则
  validationMetadatas.forEach(meta => {
    const currentMetadatas =
      metadataStorage['validationMetadatas'].get(target) || [];
    currentMetadatas.push(meta);
    metadataStorage['validationMetadatas'].set(target, currentMetadatas);
  });

  // 添加必需/可选的元数据
  const validationMetadata = new ValidationMetadata({
    target: target,
    propertyName: propertyKey,
    type: isOptional
      ? ValidationTypes.CONDITIONAL_VALIDATION
      : ValidationTypes.CUSTOM_VALIDATION,
    name: isOptional ? undefined : 'isRequired',
    constraints: isOptional
      ? [(obj: any) => obj[propertyKey] !== undefined]
      : [],
    validationOptions: {
      each: false,
      always: !isOptional,
    },
  });

  const currentMetadatas =
    metadataStorage['validationMetadatas'].get(target) || [];
  currentMetadatas.push(validationMetadata);
  metadataStorage['validationMetadatas'].set(target, currentMetadatas);

  // 如果是必需的，添加一个额外的验证规则
  if (!isOptional) {
    const requiredMetadata = new ValidationMetadata({
      target: target,
      propertyName: propertyKey,
      type: ValidationTypes.NESTED_VALIDATION,
      validationOptions: {
        each: false,
        always: true,
      },
    });
    currentMetadatas.push(requiredMetadata);
    metadataStorage['validationMetadatas'].set(target, currentMetadatas);
  }
}

export class ClassValidatorService implements IValidationService<any> {
  protected defaultClassValidatorOptions: ValidatorOptions;

  async init(container: IMidwayContainer) {
    const i18nServiceSingleton = await container.getAsync(
      MidwayI18nServiceSingleton
    );
    const configService = await container.getAsync(MidwayConfigService);
    this.defaultClassValidatorOptions =
      configService.getConfiguration('classValidator');

    for (const locale of i18nServiceSingleton.getLocaleList('classValidator')) {
      localeMapping.set(
        locale,
        i18nServiceSingleton.getOriginLocaleJSON(locale, 'classValidator')
      );
    }
  }

  validateWithSchema(
    schema: any,
    value: any,
    validationOptions: ValidationExtendOptions,
    validatorOptions: ValidatorOptions = {}
  ): ValidateResult {
    const instance = plainToInstance(schema, value);

    // get locale from options or fallback to default
    const locale = localeMapping.has(validationOptions.locale)
      ? validationOptions.locale
      : localeMapping.has(validationOptions.fallbackLocale)
      ? validationOptions.fallbackLocale
      : 'en-us';

    const errors = validateSync(instance, {
      ...this.defaultClassValidatorOptions,
      ...validatorOptions,
      messages: localeMapping.get(locale),
    });

    if (errors.length > 0) {
      const messages = errors
        .map(error => {
          if (error.constraints) {
            return Object.values(error.constraints).join(', ');
          }
          return '';
        })
        .filter(Boolean);

      return {
        status: false,
        message: messages[0],
        messages,
        error: errors[0],
        errors,
      };
    }

    return {
      status: true,
      value: instance,
    };
  }
}

export default {
  validateServiceHandler: (container: IMidwayContainer) => {
    const configService = container.get(MidwayConfigService);
    configService.addObject({
      i18n: {
        localeTable: {
          en_US: {
            classValidator: EN_I18N_MESSAGES,
          },
          zh_CN: {
            classValidator: ZH_I18N_MESSAGES,
          },
        },
      },
    });
    return new ClassValidatorService();
  },
  schemaHelper: {
    isRequired: (ClzType: any, propertyName: string): boolean => {
      return !isFieldOptional(ClzType, propertyName);
    },

    isOptional: (ClzType: any, propertyName: string): boolean => {
      return isFieldOptional(ClzType, propertyName);
    },

    setRequired: (ClzType: any, propertyName?: string): void => {
      if (propertyName) {
        // 处理单个属性
        setPropertyMetadata(ClzType, propertyName, false);
      } else {
        // 处理所有属性
        const metadataStorage = getMetadataStorage();
        const properties = metadataStorage
          .getTargetValidationMetadatas(ClzType, '', false, false)
          .map(meta => meta.propertyName as string);

        // 移除重复的属性名并保持字符串类型
        const uniqueProperties = Array.from(new Set(properties)) as string[];
        uniqueProperties.forEach(prop => {
          setPropertyMetadata(ClzType, prop, false);
        });
      }
    },

    setOptional: (ClzType: any, propertyName?: string): void => {
      if (propertyName) {
        // 处理单个属性
        setPropertyMetadata(ClzType, propertyName, true);
      } else {
        // 处理所有属性
        const metadataStorage = getMetadataStorage();
        const properties = metadataStorage
          .getTargetValidationMetadatas(ClzType, '', false, false)
          .map(meta => meta.propertyName as string);

        // 移除重复的属性名并保持字符串类型
        const uniqueProperties = Array.from(new Set(properties)) as string[];
        uniqueProperties.forEach(prop => {
          setPropertyMetadata(ClzType, prop, true);
        });
      }
    },

    getSchema(schema: any) {
      return schema;
    },

    getIntSchema(): any {
      return Number;
    },

    getBoolSchema(): any {
      return Boolean;
    },

    getFloatSchema(): any {
      return Number;
    },

    getStringSchema(): any {
      return String;
    },
  },
};
