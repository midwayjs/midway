import { IValidationService, ValidateResult, ValidationExtendOptions } from '../src';
import { RULES_KEY } from '../src';
import { IMidwayContainer, MetadataManager } from '@midwayjs/core';

interface MockSchema {
  type: string;
  optional?: boolean;
  kind?: string;
  shape?: Record<string, MockSchema>;
  properties?: Record<string, MockSchema>;
  subtype?: string;
}

// 模拟类似 Joi 风格的 validator
class MockValidatorOne implements IValidationService<MockSchema> {
  async init(container: IMidwayContainer): Promise<void> {
    // 初始化逻辑
  }

  validateWithSchema(schema: MockSchema, value: any, options: ValidationExtendOptions, validatorOptions: any): ValidateResult {
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
              // 处理对象字段的值
              validatedValue[key] = typeof fieldValue === 'string' ? fieldValue + '_one' : fieldValue;
            }
          }
          res.value = validatedValue;
        } else {
          res.value = value;
        }
      } else {
        // 处理基本类型的值
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

  getSchema(ClzType: any): MockSchema {
    const rules = MetadataManager.getPropertiesWithMetadata(RULES_KEY, ClzType);
    if (!rules || Object.keys(rules).length === 0) {
      return null;
    }
    return { type: 'object', properties: rules };
  }

  getIntSchema(): MockSchema {
    return { type: 'number', subtype: 'integer' };
  }

  getBoolSchema(): MockSchema {
    return { type: 'boolean' };
  }

  getFloatSchema(): MockSchema {
    return { type: 'number' };
  }

  getStringSchema(): MockSchema {
    return { type: 'string' };
  }
}

// 模拟类似 Zod 风格的 validator
class MockValidatorTwo implements IValidationService<MockSchema> {
  async init(container: IMidwayContainer): Promise<void> {
    // 初始化逻辑
  }

  validateWithSchema(schema: MockSchema, value: any, options: ValidationExtendOptions, validatorOptions: any): ValidateResult {
    const res = {} as ValidateResult;
    try {
      if (schema.kind === 'object' || schema.type === 'object') {
        if (typeof value !== 'object') {
          throw new Error(`Expected object, got ${typeof value}`);
        }
        if (!schema.optional && !value) {
          throw new Error('Required object');
        }
        // 简单的对象验证
        const validatedValue = {};
        const fields = schema.shape || schema.properties || {};
        for (const [key, fieldSchema] of Object.entries(fields)) {
          if (!(key in value) && !fieldSchema.optional) {
            throw new Error(`Missing required field: ${key}`);
          }
          if (key in value) {
            const fieldValue = value[key];
            // 递归验证嵌套字段
            const fieldResult = this.validateWithSchema(fieldSchema, fieldValue, options, validatorOptions);
            if (!fieldResult.status) {
              throw new Error(`Validation failed for field ${key}: ${fieldResult.message}`);
            }
            // 使用验证后的值
            validatedValue[key] = fieldResult.value;
          }
        }
        // 如果是空对象且没有必填字段,保留原始值
        if (Object.keys(validatedValue).length === 0 && Object.keys(value).length > 0) {
          res.value = value;
        } else {
          res.value = validatedValue;
        }
      } else {
        // 基础类型验证
        if (typeof value !== schema.type) {
          throw new Error(`Expected ${schema.type}, got ${typeof value}`);
        }
        // 处理基本类型的值
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

  getSchema(ClzType: any): MockSchema {
    const rules = MetadataManager.getPropertiesWithMetadata(RULES_KEY, ClzType);
    if (!rules || Object.keys(rules).length === 0) {
      return null;
    }
    return { type: 'object', kind: 'object', shape: rules };
  }

  getIntSchema(): MockSchema {
    return { type: 'number', kind: 'int' };
  }

  getBoolSchema(): MockSchema {
    return { type: 'boolean', kind: 'boolean' };
  }

  getFloatSchema(): MockSchema {
    return { type: 'number', kind: 'float' };
  }

  getStringSchema(): MockSchema {
    return { type: 'string', kind: 'string' };
  }
}

export const mockValidatorOne = new MockValidatorOne();
export const mockValidatorTwo = new MockValidatorTwo();

