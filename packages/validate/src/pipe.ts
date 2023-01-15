import * as Joi from 'joi';

export const integerSchema = Joi.number().integer().required();
export const stringSchema = Joi.string().required();
export const booleanSchema = Joi.boolean().required();

export class ParseIntPipe {
  transform(value: any, metadata: any) {
    return parseInt(value, 10);
  }
}

export class ParseBoolPipe {
  transform(value: any, metadata: any) {
    return value === 'true';
  }
}

export class ParseFloatPipe {
  transform(value: any, metadata: any) {
    return parseFloat(value);
  }
}

export class ParseArrayPipe {
  transform(value: any, metadata: any) {
    return value.split(',');
  }
}

export class DefaultValuePipe {
  transform(value: any, metadata: any) {
    return value || metadata.data;
  }
}
