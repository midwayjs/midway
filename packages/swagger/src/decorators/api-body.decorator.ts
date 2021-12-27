/* eslint-disable @typescript-eslint/ban-types */
import {
  ContentObject,
  ExamplesObject,
  ReferenceObject,
  RequestBodyObject,
  SchemaObject,
  SwaggerEnumType,
} from '../interfaces';
import {
  addEnumArraySchema,
  addEnumSchema,
  isEnumArray,
  isEnumDefined,
} from '../common/enum.utils';
import { createParamDecorator, getTypeIsArrayTuple } from './helpers';

type RequestBodyOptions = Omit<RequestBodyObject, 'content'>;

export enum BodyContentType {
  FormUrlEncoded = 'application/x-www-form-urlencoded',
  JSON = 'application/json',
  Multipart = 'multipart/form-data',
  MultipartMixed = 'multipart/mixed',
  OctetStream = 'application/octet-stream',
}

interface ApiBodyMetadata extends RequestBodyOptions {
  type?: any;
  isArray?: boolean;
  enum?: SwaggerEnumType;
  content?: ContentObject;
  contentType?: BodyContentType;
}

interface ApiBodySchemaHost extends RequestBodyOptions {
  schema: SchemaObject | ReferenceObject;
  examples?: ExamplesObject;
}

export type ApiBodyOptions = ApiBodyMetadata | ApiBodySchemaHost;

const defaultBodyMetadata: ApiBodyMetadata = {
  type: String,
  required: true,
};

export function ApiBody(options: ApiBodyOptions): MethodDecorator {
  const [type, isArray] = getTypeIsArrayTuple(
    (options as ApiBodyMetadata).type,
    (options as ApiBodyMetadata).isArray
  );
  const param: ApiBodyMetadata & Record<string, any> = {
    in: 'body',
    ...options,
    type,
    isArray,
  };

  if (isEnumArray(options)) {
    addEnumArraySchema(param, options);
  } else if (isEnumDefined(options)) {
    addEnumSchema(param, options);
  }
  return createParamDecorator(param, defaultBodyMetadata);
}