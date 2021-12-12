import {
  Type,
  ParameterObject,
  ReferenceObject,
  SchemaObject,
  SwaggerEnumType,
} from '../interfaces';
import {
  addEnumSchema,
  addEnumArraySchema,
  isEnumArray,
  isEnumDefined,
} from '../common/enum.utils';
import { createParamDecorator, getTypeIsArrayTuple } from './helpers';

type ParameterOptions = Omit<ParameterObject, 'in' | 'schema' | 'name'>;

interface ApiQueryMetadata extends ParameterOptions {
  name?: string;
  type?: Type | string;
  isArray?: boolean;
  enum?: SwaggerEnumType;
  enumName?: string;
}

interface ApiQuerySchemaHost extends ParameterOptions {
  name?: string;
  schema: SchemaObject | ReferenceObject;
}

export type ApiQueryOptions = ApiQueryMetadata | ApiQuerySchemaHost;

const defaultQueryOptions: ApiQueryOptions = {
  name: '',
  required: true,
};

export function ApiQuery(options: ApiQueryOptions): MethodDecorator {
  const apiQueryMetadata = options as ApiQueryMetadata;
  const [type, isArray] = getTypeIsArrayTuple(
    apiQueryMetadata.type,
    apiQueryMetadata.isArray
  );
  const param: any = {
    name: !options.name ? defaultQueryOptions.name : options.name,
    in: 'query',
    ...options,
    type,
  };

  if (isEnumArray(options)) {
    addEnumArraySchema(param, options);
  } else if (isEnumDefined(options)) {
    addEnumSchema(param, options);
  }

  if (isArray) {
    param.isArray = isArray;
  }

  return createParamDecorator(param, defaultQueryOptions);
}
