import { IValidationService, ValidateResult, ValidationExtendOptions } from '../src';
import { RULES_KEY } from '../src';
import { MetadataManager } from '@midwayjs/core';
import { z } from 'zod';

class ZodValidationService implements IValidationService<z.ZodType> {
  validateWithSchema(schema: z.ZodType, value: any, options: ValidationExtendOptions = {}): ValidateResult {
    let res = {} as ValidateResult;
    const { success, data, error } = schema.safeParse(value);
    if (success) {
      res.status = true;
      res.value = data;
    } else {
      res.status = false;
      (error as any).locale = options.locale;
      res.error = error;
      res.message = error.errors.map((e) => e.message).join(', ');
    }
    return res;
  }

  getSchema(ClzType: any): z.ZodType | null {
    const rules = MetadataManager.getPropertiesWithMetadata(RULES_KEY, ClzType);
    if (!rules || Object.keys(rules).length === 0) {
      return null;
    }
    const shape: Record<string, z.ZodType> = {};
    for (const key in rules) {
      shape[key] = rules[key];
    }
    return z.object(shape);
  }

  getIntSchema(): z.ZodNumber {
    return z.number().int();
  }

  getBoolSchema(): z.ZodBoolean {
    return z.boolean();
  }

  getFloatSchema(): z.ZodNumber {
    return z.number();
  }

  getStringSchema(): z.ZodString {
    return z.string();
  }
}

export const mockValidationService = new ZodValidationService();
