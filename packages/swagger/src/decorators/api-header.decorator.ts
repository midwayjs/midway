import { DECORATORS } from '../constants';
import { SwaggerEnumType, ParameterObject, Type } from '../interfaces';
import { getEnumType, getEnumValues } from '../common/enum.utils';
import { createParamDecorator } from './helpers';
import { createCustomMethodDecorator } from '@midwayjs/core';

export interface ApiHeaderOptions extends Omit<ParameterObject, 'in'> {
  enum?: SwaggerEnumType;
}

const defaultHeaderOptions: Partial<ApiHeaderOptions> = {
  name: '',
};

export function ApiHeader(options: ApiHeaderOptions): any {
  const param = {
    name: !options.name ? defaultHeaderOptions.name : options.name,
    in: 'header',
    description: options.description,
    required: options.required,
    schema: {
      ...(options.schema || {}),
      type: 'string',
    },
  };

  if (options.enum) {
    const enumValues = getEnumValues(options.enum);
    param.schema = {
      enum: enumValues,
      type: getEnumType(enumValues),
    };
  }

  return (
    target: object | Type,
    key?: string | symbol,
    descriptor?: TypedPropertyDescriptor<any>
  ): any => {
    if (descriptor) {
      return createParamDecorator(param, defaultHeaderOptions as any)(
        target,
        key,
        descriptor
      );
    }
    return createCustomMethodDecorator(DECORATORS.API_HEADERS, param, false)(
      target,
      undefined,
      undefined
    );
  };
}

export const ApiHeaders = (
  headers: ApiHeaderOptions[]
): MethodDecorator & ClassDecorator => {
  return (
    target: object | Type,
    key?: string | symbol,
    descriptor?: TypedPropertyDescriptor<any>
  ): any => {
    headers.forEach(options => ApiHeader(options)(target, key, descriptor));
  };
};
