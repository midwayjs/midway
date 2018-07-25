import 'reflect-metadata';

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
