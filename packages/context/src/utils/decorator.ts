import 'reflect-metadata';
import {DUPLICATED_METADATA, INVALID_DECORATOR_OPERATION} from './errMsg';
import {TAGGED, TAGGED_PROP} from './metaKeys';
import {TagPropsMetadata, ReflectResult} from '../interfaces';

function tagParameter(
  annotationTarget: any,
  propertyName: string,
  parameterIndex: number,
  metadata: TagPropsMetadata
) {
  _tagParameterOrProperty(TAGGED, annotationTarget, propertyName, metadata, parameterIndex);
}

function tagProperty(
  annotationTarget: any,
  propertyName: string,
  metadata: TagPropsMetadata
) {
  _tagParameterOrProperty(TAGGED_PROP, annotationTarget.constructor, propertyName, metadata);
}

function _tagParameterOrProperty(
  metadataKey: string,
  annotationTarget: any,
  propertyName: string,
  metadata: TagPropsMetadata,
  parameterIndex?: number
) {

  let paramsOrPropertiesMetadata: ReflectResult = {};
  const isParameterDecorator = (typeof parameterIndex === 'number');
  const key: string = (parameterIndex !== undefined && isParameterDecorator) ? parameterIndex.toString() : propertyName;

  // if the decorator is used as a parameter decorator, the property name must be provided
  if (isParameterDecorator && propertyName !== undefined) {
    throw new Error(INVALID_DECORATOR_OPERATION);
  }

  // read metadata if available
  if (Reflect.hasOwnMetadata(metadataKey, annotationTarget)) {
    paramsOrPropertiesMetadata = Reflect.getMetadata(metadataKey, annotationTarget);
  }

  // get metadata for the decorated parameter by its index
  let paramOrPropertyMetadata: TagPropsMetadata[] = paramsOrPropertiesMetadata[key];

  if (!Array.isArray(paramOrPropertyMetadata)) {
    paramOrPropertyMetadata = [];
  } else {
    for (const m of paramOrPropertyMetadata) {
      if (m.key === metadata.key) {
        throw new Error(`${DUPLICATED_METADATA} ${m.key.toString()}`);
      }
    }
  }

  // set metadata
  paramOrPropertyMetadata.push(metadata);
  paramsOrPropertiesMetadata[key] = paramOrPropertyMetadata;
  Reflect.defineMetadata(metadataKey, paramsOrPropertiesMetadata, annotationTarget);
}

export { tagParameter, tagProperty };
