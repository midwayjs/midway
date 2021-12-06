import {
  Type,
  ParameterObject,
  SchemaObject,
  SwaggerEnumType
} from '../interfaces';
import { createParamDecorator } from './helpers';
import { getEnumValues, getEnumType } from '../common/enum.utils';

type ParameterOptions = Omit<ParameterObject, 'in' | 'schema'>;

interface ApiParamMetadata extends ParameterOptions {
  type?: Type | Function | [Function] | string;
  format?: string;
  enum?: SwaggerEnumType;
  enumName?: string;
}

interface ApiParamSchemaHost extends ParameterOptions {
  schema: SchemaObject;
}

export type ApiParamOptions = ApiParamMetadata | ApiParamSchemaHost;

const defaultParamOptions: ApiParamOptions = {
  name: '',
  required: true
};

export function ApiParam(options: ApiParamOptions): MethodDecorator {
  const param: Record<string, any> = {
    name: !options.name ? defaultParamOptions.name : options.name,
    in: 'path',
    ...options
  };

  const apiParamMetadata = options as ApiParamMetadata;
  if (apiParamMetadata.enum) {
    param.schema = param.schema || ({} as SchemaObject);

    const paramSchema = param.schema as SchemaObject;
    const enumValues = getEnumValues(apiParamMetadata.enum);
    paramSchema.type = getEnumType(enumValues);
    paramSchema.enum = enumValues;

    if (apiParamMetadata.enumName) {
      param.enumName = apiParamMetadata.enumName;
    }
  }

  return createParamDecorator(param, defaultParamOptions);
}
