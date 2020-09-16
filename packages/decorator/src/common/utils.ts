import {
  getParamNames,
  getClassMetadata,
  saveClassMetadata,
} from './decoratorManager';
import {
  CLASS_KEY_CONSTRUCTOR,
  OBJ_DEF_CLS,
  TAGGED,
  TAGGED_PROP,
  TAGGED_CLS,
  INJECT_TAG,
} from './constant';
import {
  TagPropsMetadata,
  ReflectResult,
  ObjectIdentifier,
  ObjectDefinitionOptions,
} from '../interface';
import {
  DUPLICATED_METADATA,
  INVALID_DECORATOR_OPERATION,
  DUPLICATED_INJECTABLE_DECORATOR,
} from './errMsg';
import camelcase = require('camelcase');
import { Metadata } from './metadata';

function _tagParameterOrProperty(
  metadataKey: string,
  annotationTarget: any,
  propertyName: string,
  metadata: TagPropsMetadata,
  parameterIndex?: number
) {
  let paramsOrPropertiesMetadata: ReflectResult = {};
  const isParameterDecorator = typeof parameterIndex === 'number';
  const key: string =
    parameterIndex !== undefined && isParameterDecorator
      ? parameterIndex.toString()
      : propertyName;

  // if the decorator is used as a parameter decorator, the property name must be provided
  if (isParameterDecorator && propertyName !== undefined) {
    throw new Error(INVALID_DECORATOR_OPERATION);
  }

  // read metadata if available
  if (Reflect.hasOwnMetadata(metadataKey, annotationTarget)) {
    paramsOrPropertiesMetadata = Reflect.getMetadata(
      metadataKey,
      annotationTarget
    );
  }

  // get metadata for the decorated parameter by its index
  let paramOrPropertyMetadata: TagPropsMetadata[] =
    paramsOrPropertiesMetadata[key];

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
  Reflect.defineMetadata(
    metadataKey,
    paramsOrPropertiesMetadata,
    annotationTarget
  );
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
    type,
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

interface InjectOptions {
  identifier: ObjectIdentifier;
  target: any;
  targetKey: string;
  index?: number;
  args?: any;
}
/**
 * 构造器注入
 * @param opts 参数
 */
export function saveConstructorInject(opts: InjectOptions) {
  let identifier = opts.identifier;
  if (!identifier) {
    const args = getParamNames(opts.target);
    if (opts.target.length === args.length && opts.index < opts.target.length) {
      identifier = args[opts.index];
    }
  } else if (identifier.includes('@') && !identifier.includes(':')) {
    const args = getParamNames(opts.target);
    if (opts.target.length === args.length && opts.index < opts.target.length) {
      identifier = `${identifier}:${args[opts.index]}`;
    }
  }
  const metadata = new Metadata(INJECT_TAG, identifier);
  metadata.args = opts.args;
  _tagParameterOrProperty(
    TAGGED,
    opts.target,
    opts.targetKey,
    metadata,
    opts.index
  );
}

export function getConstructorInject(target: any): TagPropsMetadata[] {
  return Reflect.getMetadata(TAGGED, target);
}
/**
 * 属性注入
 * @param opts 参数
 */
export function savePropertyInject(opts: InjectOptions) {
  let identifier = opts.identifier;
  if (!identifier) {
    identifier = opts.targetKey;
  }
  if (identifier.includes('@') && !identifier.includes(':')) {
    identifier = `${identifier}:${opts.targetKey}`;
  }
  const metadata = new Metadata(INJECT_TAG, identifier);
  metadata.args = opts.args;
  _tagParameterOrProperty(
    TAGGED_PROP,
    opts.target.constructor,
    opts.targetKey,
    metadata
  );
}

export function getPropertyInject(target: any): TagPropsMetadata[] {
  return Reflect.getMetadata(TAGGED_PROP, target);
}
/**
 * class 元数据定义
 * @param target class
 * @param props 属性
 */
export function saveObjectDefProps(target: any, props: object = {}) {
  if (Reflect.hasMetadata(OBJ_DEF_CLS, target)) {
    const originProps = Reflect.getMetadata(OBJ_DEF_CLS, target);

    Reflect.defineMetadata(
      OBJ_DEF_CLS,
      Object.assign(originProps, props),
      target
    );
  } else {
    Reflect.defineMetadata(OBJ_DEF_CLS, props, target);
  }
  return target;
}

export function getObjectDefProps(target: any): ObjectDefinitionOptions {
  return Reflect.getMetadata(OBJ_DEF_CLS, target);
}
/**
 * class provider id
 * @param identifier id
 * @param target class
 * @param override 是否覆盖
 */
export function saveProviderId(
  identifier: ObjectIdentifier,
  target: any,
  override?: boolean
) {
  if (Reflect.hasOwnMetadata(TAGGED_CLS, target) && !override) {
    throw new Error(DUPLICATED_INJECTABLE_DECORATOR);
  }

  if (!identifier) {
    identifier = classNamed(target.name);
  }

  Reflect.defineMetadata(
    TAGGED_CLS,
    {
      id: identifier,
      originName: target.name,
    },
    target
  );

  if (!Reflect.hasMetadata(OBJ_DEF_CLS, target)) {
    Reflect.defineMetadata(OBJ_DEF_CLS, {}, target);
  }

  return target;
}
/**
 * 是否使用了 saveProviderId
 * @param target class
 */
export function isProvide(target: any): boolean {
  return Reflect.hasOwnMetadata(TAGGED_CLS, target);
}
