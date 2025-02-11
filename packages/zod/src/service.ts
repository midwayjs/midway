import { Singleton } from '@midwayjs/core';
import { z } from 'zod';
import {
  getRuleMeta,
  IValidationService,
  ValidateResult,
  ValidationExtendOptions,
} from '@midwayjs/validation';

@Singleton()
export class ZodValidationService implements IValidationService<z.ZodType> {
  public validateWithSchema(
    schema: z.ZodType,
    value: any,
    options: ValidationExtendOptions = {}
  ) {
    const res = {} as ValidateResult;
    const zodGlobalOptions = options.validateOptions;
    const { success, data, error } = schema.safeParse(value, zodGlobalOptions);
    if (success) {
      res.status = true;
      res.value = data;
    } else {
      res.status = false;
      res.error = error;
      res.message = error.errors.map(e => e.message).join(', ');
    }
    return res;
  }

  public getSchema(ClzType: any): z.ZodType<any, z.ZodTypeDef, any> {
    const ruleMetas = getRuleMeta(ClzType);
    return z.object(ruleMetas);
  }

  public getIntSchema(): z.ZodType<any, z.ZodTypeDef, any> {
    return z.number().int();
  }

  public getBoolSchema(): z.ZodType<any, z.ZodTypeDef, any> {
    return z.boolean();
  }

  public getFloatSchema(): z.ZodType<any, z.ZodTypeDef, any> {
    return z.number();
  }

  public getStringSchema(): z.ZodType<any, z.ZodTypeDef, any> {
    return z.string();
  }
}
