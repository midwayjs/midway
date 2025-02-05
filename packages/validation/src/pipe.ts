import {
  MetadataManager,
  Inject,
  Pipe,
  PipeTransform,
  REQUEST_OBJ_CTX_KEY,
  TransformOptions,
} from '@midwayjs/core';
import * as i18n from '@midwayjs/i18n';
import { VALIDATE_KEY } from './constants';
import { ValidationServiceStore } from './store';
import { ValidationService } from './service';
import { ValidationOptions } from './interface';

export abstract class AbstractValidationPipe implements PipeTransform {
  @Inject()
  protected validationService: ValidationService;

  @Inject()
  protected validationServiceStore: ValidationServiceStore<any>;

  abstract transform(value: any, options: TransformOptions);

  public validateWithSchema(
    value: any,
    options: TransformOptions,
    schema: any
  ) {
    const validateOptions = this.parseValidationOptions(options);
    return this.validationService.validate(
      value,
      {
        schema,
        validationOptions: validateOptions,
      }
    ) ?? value;
  }

  public validate(value: any, options: TransformOptions) {
    const validateOptions = this.parseValidationOptions(options);
    if (options.metaType.isBaseType) {
      return value;
    }
    return this.validationService.validate(
      options.metaType.originDesign as any,
      value,
      {
        validateOptions,
      }
    ) ?? value;
  }

  protected parseValidationOptions(options: TransformOptions): ValidationOptions {
    const validateOptions: ValidationOptions =
      MetadataManager.getMetadata(
        VALIDATE_KEY,
        options.target,
        options.methodName
      ) || {};

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
  getSchema(): any {
    return this.validationServiceStore.getValidationService().getIntSchema();
  }
}

@Pipe()
export class ParseBoolPipe extends ParsePipe {
  getSchema(): any {
    return this.validationServiceStore.getValidationService().getBoolSchema();
  }
}

@Pipe()
export class ParseFloatPipe extends ParsePipe {
  getSchema(): any {
    return this.validationServiceStore.getValidationService().getFloatSchema();
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
