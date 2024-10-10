import {
  MetadataManager,
  Inject,
  Pipe,
  PipeTransform,
  REQUEST_OBJ_CTX_KEY,
  TransformOptions,
} from '@midwayjs/core';
import { ValidateService } from './service';
import * as i18n from '@midwayjs/i18n';
import { VALIDATE_KEY } from './constants';
import { ValidateOptions } from './decorator/validate';
import * as Joi from 'joi';

export abstract class AbstractValidationPipe implements PipeTransform {
  @Inject()
  protected validateService: ValidateService;
  abstract transform(value: any, options: TransformOptions);

  validateWithSchema(
    value: any,
    options: TransformOptions,
    schema: Joi.AnySchema
  ) {
    const validateOptions = this.parseValidationOptions(options);
    const result = this.validateService.validateWithSchema(
      schema,
      value,
      validateOptions
    );
    if (result && result.value !== undefined) {
      return result.value;
    }
    return value;
  }

  validate(value: any, options: TransformOptions) {
    const validateOptions = this.parseValidationOptions(options);
    if (options.metaType.isBaseType) {
      return value;
    }
    const result = this.validateService.validate(
      options.metaType.originDesign as any,
      value,
      validateOptions
    );
    if (result && result.value) {
      return result.value;
    }
    return value;
  }

  protected parseValidationOptions(options: TransformOptions): ValidateOptions {
    const validateOptions: ValidateOptions =
      MetadataManager.getMetadata(VALIDATE_KEY, options.target, options.methodName) ||
      {};

    if (!validateOptions.locale) {
      const maybeCtx = options.target[REQUEST_OBJ_CTX_KEY];
      if (maybeCtx && maybeCtx.getAttr) {
        validateOptions.locale = maybeCtx.getAttr(i18n.I18N_ATTR_KEY);
      }
    }

    return validateOptions;
  }

  protected getSchema() {
    return undefined;
  }
}

@Pipe()
export class ValidationPipe extends AbstractValidationPipe {
  transform(value: any, options: TransformOptions) {
    return this.validate(value, options);
  }
}

export abstract class ParsePipe extends AbstractValidationPipe {
  transform(value: any, options: TransformOptions) {
    return this.validateWithSchema(
      value,
      options,
      options.metadata['schema'] || this.getSchema()
    );
  }
}

@Pipe()
export class DecoratorValidPipe extends ParsePipe {}

@Pipe()
export class ParseIntPipe extends ParsePipe {
  getSchema(): Joi.AnySchema<any> {
    return Joi.number().integer().required();
  }
}

@Pipe()
export class ParseBoolPipe extends ParsePipe {
  getSchema(): Joi.AnySchema<any> {
    return Joi.boolean().required();
  }
}

@Pipe()
export class ParseFloatPipe extends ParsePipe {
  getSchema(): Joi.AnySchema<any> {
    return Joi.number().required();
  }
}

export class DefaultValuePipe<T = any, R = any> implements PipeTransform<T, R> {
  constructor(protected readonly defaultValue: R) {}
  transform(value: any, options: any) {
    if (
      value === undefined ||
      value === null ||
      (typeof value === 'number' && isNaN(value as unknown as number))
    ) {
      return this.defaultValue;
    }
    return value;
  }
}
