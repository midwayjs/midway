import 'reflect-metadata';
import * as path from 'path';
import * as fs from 'fs';
import {CLASS_KEY_CONSTRUCTOR} from './decorators/metaKeys';

export function attachMetaDataOnClass(clz, key, value) {
  // save method name on class
  let classMetaValue = Reflect.getMetadata(key, clz);
  if(classMetaValue) {
    classMetaValue = classMetaValue.concat(value);
  } else {
    classMetaValue = [value];
  }
  Reflect.defineMetadata(key, classMetaValue, clz);
}

export function attachConstructorDataOnClass(identifier, clz, type, index) {

  if (!identifier) {
    const args = getParamNames(clz);
    if (clz.length === args.length && index < clz.length) {
      identifier = args[index];
    }
  }

  // save constructor index on class
  let constructorMetaValue = Reflect.getOwnMetadata(CLASS_KEY_CONSTRUCTOR, clz);
  if(!constructorMetaValue) {
    constructorMetaValue = {};
  }
  constructorMetaValue[index] = {
    key: identifier,
    type
  };
  Reflect.defineMetadata(CLASS_KEY_CONSTRUCTOR, constructorMetaValue, clz);
}

const STRIP_COMMENTS = /((\/\/.*$)|(\/\*[\s\S]*?\*\/))/mg;
const ARGUMENT_NAMES = /([^\s,]+)/g;

export function getParamNames(func) {
  const fnStr = func.toString().replace(STRIP_COMMENTS, '');
  let result = fnStr.slice(fnStr.indexOf('(') + 1, fnStr.indexOf(')')).match(ARGUMENT_NAMES);
  if (result === null) {
    result = [];
  }
  return result;
}
