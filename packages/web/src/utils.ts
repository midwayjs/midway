import 'reflect-metadata';
import * as path from 'path';
import * as fs from 'fs';
import {CLASS_KEY_CONSTRUCTOR} from './decorators/metaKeys';

/**
 * 处理 midway 配置和 egg 配置不一样的问题
 * @param config
 * @returns {any}
 */
export function parserConfig(config = {}) {

  if(!config) {
    return config;
  }

  // 中间件配置单数化
  if(config['middlewares']) {
    config['middleware'] = config['middlewares'];
    delete config['middlewares'];
  }

  // 解析默认日志 defaultLogger -> logger
  if(config['defaultLogger']) {
    config['logger'] = config['defaultLogger'];
    delete config['defaultLogger'];
  }

  if(config['loggers']) {
    config['customLogger'] = config['loggers'];
    delete config['loggers'];
  }

  return config;
}

export function isMidwayPlugin(name) {
  return /midway-plugin-/.test(name);
}

export function getPluralDirectory(base, directory) {
  const d = path.join(base, directory);
  if (fs.existsSync(d)) {
    return d;
  }
}


/**
 * get plugin name from package
 * @example
 *  "eggPlugin": {
 *    "name": "plugin"
 *   }
 * @param pkg
 * @returns {string}
 */
export function getPluginName(pkg) {
  let info = pkg['eggPlugin'] || pkg['midwayPlugin'];
  return info.name;
}

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

export function addTypescriptSupport() {
  const suffix = path.extname(__filename);
  if(process.env.EGG_TYPESCRIPT === 'true'
    || /\.ts/.test(suffix)
    || /ts-node/.test(process.argv[0])) {
    try {
      require('ts-node/register');
    } catch (e) {
      throw new Error('Need ts-node(https://github.com/TypeStrong/ts-node) be installed!');
    }
    // 打开 egg 加载 ts 的开关
    process.env.EGG_TYPESCRIPT = 'true';
  }
}

export function isTypeScriptEnvironment() {
  return !!require.extensions['.ts'];
}
