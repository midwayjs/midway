import { getParamNames, getClassMetadata, saveClassMetadata } from './decoratorManager';
import { CLASS_KEY_CONSTRUCTOR, OBJ_DEF_CLS, TAGGED, TAGGED_PROP} from './constant';
import { ObjectDefinitionOptions, TagPropsMetadata, ReflectResult } from '../interface';
import { DUPLICATED_METADATA, INVALID_DECORATOR_OPERATION } from './errMsg';
import camelcase = require('camelcase');

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

export function tagParameter(
  annotationTarget: any,
  propertyName: string,
  parameterIndex: number,
  metadata: TagPropsMetadata
) {
  _tagParameterOrProperty(TAGGED, annotationTarget, propertyName, metadata, parameterIndex);
}

export function tagProperty(
  annotationTarget: any,
  propertyName: string,
  metadata: TagPropsMetadata
) {
  _tagParameterOrProperty(TAGGED_PROP, annotationTarget.constructor, propertyName, metadata);
}

export function initOrGetObjectDefProps(target): ObjectDefinitionOptions {
  const result = Reflect.hasMetadata(OBJ_DEF_CLS, target);
  if (!result) {
    Reflect.defineMetadata(OBJ_DEF_CLS, {}, target);
  }
  return Reflect.getMetadata(OBJ_DEF_CLS, target);
}

export function attachConstructorDataOnClass(identifier, clz, type, index) {

  if (!identifier) {
    const args = getParamNames(clz);
    if (clz.length === args.length && index < clz.length) {
      identifier = args[index];
    }
  }

  // save constructor index on class
  let constructorMetaValue = getClassMetadata(CLASS_KEY_CONSTRUCTOR, clz);
  if (!constructorMetaValue) {
    constructorMetaValue = {};
  }
  constructorMetaValue[index] = {
    key: identifier,
    type
  };
  saveClassMetadata(CLASS_KEY_CONSTRUCTOR, constructorMetaValue, clz);
}
/**
 * 按照框架规则返回类名字
 * @param name 类名称
 */
export function classNamed(name: string) {
  return camelcase(name);
}
