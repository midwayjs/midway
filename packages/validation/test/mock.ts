import { IValidationService, ValidateResult, ValidationExtendOptions, IValidator } from '../src';
import { RULES_KEY } from '../src';
import { IMidwayContainer, MetadataManager } from '@midwayjs/core';

interface MockSchema {
  type: string;
  optional?: boolean;
  kind?: string;
  shape?: Record<string, MockSchema>;
  properties?: Record<string, MockSchema>;
  subtype?: string;
  min?: number;
  max?: number;
}

// Mock Validator One
export const mockValidatorOne: IValidator<MockSchema> = {
  schemaHelper: {
    isRequired: (ClzType: any, propertyName: string): boolean => {
      const rules = MetadataManager.getPropertiesWithMetadata(RULES_KEY, ClzType);
      return rules[propertyName] && !rules[propertyName].optional;
    },
    isOptional: (ClzType: any, propertyName: string): boolean => {
      const rules = MetadataManager.getPropertiesWithMetadata(RULES_KEY, ClzType);
      return rules[propertyName]?.optional === true;
    },
    setRequired: (ClzType: any, propertyName?: string): void => {
      const rules = MetadataManager.getPropertiesWithMetadata(RULES_KEY, ClzType);
      if (propertyName) {
        // 处理单个属性
        if (rules[propertyName]) {
          const newRule = { ...rules[propertyName] };
          delete newRule.optional;
          MetadataManager.defineMetadata(RULES_KEY, newRule, ClzType, propertyName);
        }
      } else {
        // 处理所有属性
        Object.entries(rules).forEach(([key, rule]) => {
          if (rule) {
            const newRule = { ...rule };
            delete newRule.optional;
            MetadataManager.defineMetadata(RULES_KEY, newRule, ClzType, key);
          }
        });
      }
    },
    setOptional: (ClzType: any, propertyName?: string): void => {
      const rules = MetadataManager.getPropertiesWithMetadata(RULES_KEY, ClzType);
      if (propertyName) {
        // 处理单个属性
        if (rules[propertyName]) {
          const newRule = { ...rules[propertyName], optional: true };
          MetadataManager.defineMetadata(RULES_KEY, newRule, ClzType, propertyName);
        }
      } else {
        // 处理所有属性
        Object.entries(rules).forEach(([key, rule]) => {
          if (rule) {
            const newRule = { ...rule, optional: true };
            MetadataManager.defineMetadata(RULES_KEY, newRule, ClzType, key);
          }
        });
      }
    },
    getSchema: (ClzType: any): MockSchema => {
      const rules = MetadataManager.getPropertiesWithMetadata(RULES_KEY, ClzType);
      if (!rules || Object.keys(rules).length === 0) {
        return null;
      }

      // 处理每个属性的多个规则
      const processedRules = {};
      for (const [key, rule] of Object.entries(rules)) {
        if (Array.isArray(rule)) {
          // 合并多个规则
          processedRules[key] = rule.reduce((merged, current) => ({
            ...merged,
            ...current,
            optional: merged.optional || current.optional
          }));
        } else {
          processedRules[key] = rule;
        }
      }

      return { type: 'object', properties: processedRules };
    },
    getIntSchema: (): MockSchema => {
      return { type: 'number', subtype: 'integer' };
    },
    getBoolSchema: (): MockSchema => {
      return { type: 'boolean' };
    },
    getFloatSchema: (): MockSchema => {
      return { type: 'number' };
    },
    getStringSchema: (): MockSchema => {
      return { type: 'string' };
    },
  },
  validateServiceHandler: async (container: IMidwayContainer) => {
    return new (class implements IValidationService<MockSchema> {
      async init(container: IMidwayContainer): Promise<void> {
        // 初始化逻辑
      }

      validateWithSchema(schema: MockSchema, value: any, options: ValidationExtendOptions, validatorOptions: any): ValidateResult {
        if (Array.isArray(schema)) {
          schema = schema[0];
        }
        const res = {} as ValidateResult;
        try {
          // 简单的类型检查
          if (schema.type === 'number' && typeof value !== 'number') {
            throw new Error('Expected number');
          }
          if (schema.type === 'string' && typeof value !== 'string') {
            throw new Error('Expected string');
          }
          if (schema.type === 'boolean' && typeof value !== 'boolean') {
            throw new Error('Expected boolean');
          }
          if (schema.type === 'object') {
            if (typeof value !== 'object') {
              throw new Error('Expected object');
            }
            if (!schema.optional && !value) {
              throw new Error('Required object');
            }
            // 验证对象的内部字段
            if (value && schema.properties) {
              const validatedValue = {};
              for (const [key, fieldSchema] of Object.entries(schema.properties)) {
                if (!(key in value) && !fieldSchema.optional) {
                  throw new Error(`Missing required field: ${key}`);
                }
                if (key in value) {
                  const fieldValue = value[key];
                  const fieldResult = this.validateWithSchema(fieldSchema, fieldValue, options, validatorOptions);
                  if (!fieldResult.status) {
                    throw new Error(`Validation failed for field ${key}: ${fieldResult.message}`);
                  }
                  validatedValue[key] = typeof fieldValue === 'string' ? fieldValue + '_one' : fieldValue;
                }
              }
              res.value = validatedValue;
            } else {
              res.value = value;
            }
          } else {
            res.value = typeof value === 'string' ? value + '_one' : value;
          }

          res.status = true;
        } catch (error) {
          res.status = false;
          res.error = error;
          res.message = error.message;
        }
        return res;
      }
    })();
  }
};

// Mock Validator Two
export const mockValidatorTwo: IValidator<MockSchema> = {
  schemaHelper: {
    isRequired: (ClzType: any, propertyName: string): boolean => {
      const rules = MetadataManager.getPropertiesWithMetadata(RULES_KEY, ClzType);
      return rules[propertyName] && !rules[propertyName].optional;
    },
    isOptional: (ClzType: any, propertyName: string): boolean => {
      const rules = MetadataManager.getPropertiesWithMetadata(RULES_KEY, ClzType);
      return rules[propertyName]?.optional === true;
    },
    setRequired: (ClzType: any, propertyName?: string): void => {
      const rules = MetadataManager.getPropertiesWithMetadata(RULES_KEY, ClzType);
      if (propertyName) {
        // 处理单个属性
        if (rules[propertyName]) {
          const newRule = { ...rules[propertyName] };
          delete newRule.optional;
          MetadataManager.defineMetadata(RULES_KEY, newRule, ClzType, propertyName);
        }
      } else {
        // 处理所有属性
        Object.entries(rules).forEach(([key, rule]) => {
          if (rule) {
            const newRule = { ...rule };
            delete newRule.optional;
            MetadataManager.defineMetadata(RULES_KEY, newRule, ClzType, key);
          }
        });
      }
    },
    setOptional: (ClzType: any, propertyName?: string): void => {
      const rules = MetadataManager.getPropertiesWithMetadata(RULES_KEY, ClzType);
      if (propertyName) {
        // 处理单个属性
        if (rules[propertyName]) {
          const newRule = { ...rules[propertyName], optional: true };
          MetadataManager.defineMetadata(RULES_KEY, newRule, ClzType, propertyName);
        }
      } else {
        // 处理所有属性
        Object.entries(rules).forEach(([key, rule]) => {
          if (rule) {
            const newRule = { ...rule, optional: true };
            MetadataManager.defineMetadata(RULES_KEY, newRule, ClzType, key);
          }
        });
      }
    },
    getSchema: (ClzType: any): MockSchema | [MockSchema] => {
      const rules = MetadataManager.getPropertiesWithMetadata(RULES_KEY, ClzType);
      if (!rules || Object.keys(rules).length === 0) {
        return null;
      }

      // 处理每个属性的多个规则
      const processedRules = {};
      for (const [key, rule] of Object.entries(rules)) {
        if (Array.isArray(rule)) {
          // 合并多个规则
          processedRules[key] = rule.reduce((merged, current) => ({
            ...merged,
            ...current,
            optional: merged.optional || current.optional,
            min: Math.max(merged.min || 0, current.min || 0),
            max: Math.min(merged.max === undefined ? Infinity : merged.max,
                         current.max === undefined ? Infinity : current.max)
          }));
        } else {
          processedRules[key] = rule;
        }
      }

      return { type: 'object', kind: 'object', shape: processedRules };
    },
    getIntSchema: (): MockSchema => {
      return { type: 'number', kind: 'int' };
    },
    getBoolSchema: (): MockSchema => {
      return { type: 'boolean', kind: 'boolean' };
    },
    getFloatSchema: (): MockSchema => {
      return { type: 'number', kind: 'float' };
    },
    getStringSchema: (): MockSchema => {
      return { type: 'string', kind: 'string' };
    }
  },
  validateServiceHandler: async (container: IMidwayContainer) => {
    return new (class implements IValidationService<MockSchema> {
      async init(container: IMidwayContainer): Promise<void> {
        // 初始化逻辑
      }

      validateWithSchema(schema: MockSchema, value: any, options: ValidationExtendOptions, validatorOptions: any): ValidateResult {
        if (Array.isArray(schema)) {
          schema = schema[0];
        }
        const res = {} as ValidateResult;
        try {
          if (schema.kind === 'object' || schema.type === 'object') {
            if (typeof value !== 'object') {
              throw new Error(`Expected object, got ${typeof value}`);
            }
            if (!schema.optional && !value) {
              throw new Error('Required object');
            }
            const validatedValue = {};
            const fields = schema.shape || schema.properties || {};
            for (const [key, fieldSchema] of Object.entries(fields)) {
              if (!(key in value) && !fieldSchema.optional) {
                throw new Error(`Missing required field: ${key}`);
              }
              if (key in value) {
                const fieldValue = value[key];
                const fieldResult = this.validateWithSchema(fieldSchema, fieldValue, options, validatorOptions);
                if (!fieldResult.status) {
                  throw new Error(`Validation failed for field ${key}: ${fieldResult.message}`);
                }
                validatedValue[key] = fieldResult.value;
              }
            }
            if (Object.keys(validatedValue).length === 0 && Object.keys(value).length > 0) {
              res.value = value;
            } else {
              res.value = validatedValue;
            }
          } else {
            if (typeof value !== schema.type) {
              throw new Error(`Expected ${schema.type}, got ${typeof value}`);
            }
            // 添加字符串长度验证
            if (schema.type === 'string') {
              const strValue = String(value);
              if (schema.min !== undefined && strValue.length < schema.min) {
                throw new Error(`String length must be at least ${schema.min}`);
              }
              if (schema.max !== undefined && strValue.length > schema.max) {
                throw new Error(`String length must be at most ${schema.max}`);
              }
            }
            res.value = typeof value === 'string' ? value + '_two' : value;
          }
          res.status = true;
        } catch (error) {
          res.status = false;
          res.error = error;
          res.message = error.message;
        }
        return res;
      }
    })();
  }
};

