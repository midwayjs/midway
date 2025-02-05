import { Provide, Scope, ScopeEnum, Config } from '@midwayjs/core';
import { z } from 'zod';
import {
  getRuleMeta,
  IValidationService,
  MidwayValidationError,
  ValidationExtendOptions,
} from '@midwayjs/validation';

@Provide()
@Scope(ScopeEnum.Singleton)
export class ZodValidationService implements IValidationService<z.ZodType> {
  @Config('validate')
  protected validateConfig;

  async validate(
    clzType: any,
    value: any,
    options: ValidationExtendOptions = {}
  ) {
    const schema = this.getSchema(clzType);
    return this.validateWithSchema(schema, value, options);
  }

  public validateWithSchema(
    schema: z.ZodType,
    value: any,
    options: ValidationExtendOptions = {}
  ) {
    try {
      const result = schema.parse(value);
      return result;
    } catch (err) {
      if (err instanceof z.ZodError) {
        throw new MidwayValidationError(
          err.message,
          options.errorStatus || this.validateConfig?.errorStatus,
          err
        );
      }
      throw err;
    }
  }

  public getSchema(ClzType: any): z.ZodType<any, z.ZodTypeDef, any> {
    const ruleMetas = getRuleMeta(ClzType);
    return z.object(ruleMetas);
  }

  public getIntSchema(): z.ZodType<any, z.ZodTypeDef, any> {
    return z.number();
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
