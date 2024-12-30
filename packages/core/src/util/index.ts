import { dirname, resolve, sep, posix, join } from 'path';
import { readFileSync } from 'fs';
import { debuglog } from 'util';
import { PathToRegexpUtil } from './pathToRegexp';
import { MidwayCommonError } from '../error';
import { FunctionMiddleware, IgnoreMatcher } from '../interface';
import { camelCase, pascalCase } from './camelCase';
import { randomUUID } from './uuid';
import { safeParse, safeStringify } from './flatted';
import * as crypto from 'crypto';
import { Types } from './types';
import { pathToFileURL } from 'url';
import { normalizePath } from './pathFileUtil';
import { MetadataManager } from '../decorator/metadataManager';
import { CONFIGURATION_KEY, CONFIGURATION_OBJECT_KEY } from '../decorator';

const debug = debuglog('midway:debug');

/**
 * @since 2.0.0
 * @param env
 */
export const isDevelopmentEnvironment = env => {
  return ['local', 'test', 'unittest'].includes(env);
};

/**
 * @since 2.0.0
 */
export const getCurrentEnvironment = () => {
  return process.env['MIDWAY_SERVER_ENV'] || process.env['NODE_ENV'] || 'prod';
};

/**
 * @param p
 * @param enabledCache
 * @since 2.0.0
 */
export const safeRequire = (p, enabledCache = true) => {
  if (p.startsWith(`.${sep}`) || p.startsWith(`..${sep}`)) {
    p = resolve(dirname(module.parent.filename), p);
  }
  try {
    if (enabledCache) {
      return require(p);
    } else {
      const content = readFileSync(p, {
        encoding: 'utf-8',
      });
      return JSON.parse(content);
    }
  } catch (err) {
    debug(`[core]: SafeRequire Warning\n\n${err.message}\n`);
    return undefined;
  }
};

const innerLoadModuleCache = {};

/**
 * load module, and it can be chosen commonjs or esm mode
 * @param p
 * @param options
 * @since 3.12.0
 */
export const loadModule = async (
  p: string,
  options: {
    enableCache?: boolean;
    loadMode?: 'commonjs' | 'esm';
    safeLoad?: boolean;
    warnOnLoadError?: boolean;
  } = {}
) => {
  options.enableCache = options.enableCache ?? true;
  options.safeLoad = options.safeLoad ?? false;
  options.loadMode = options.loadMode ?? 'commonjs';

  if (p.startsWith(`.${sep}`) || p.startsWith(`..${sep}`)) {
    p = resolve(dirname(module.parent.filename), p);
  }

  debug(
    `[core]: load module ${p}, cache: ${options.enableCache}, mode: ${options.loadMode}, safeLoad: ${options.safeLoad}`
  );

  try {
    if (options.enableCache) {
      if (options.loadMode === 'commonjs') {
        return require(p);
      } else {
        // if json file, import need add options
        if (p.endsWith('.json')) {
          /**
           * attention: import json not support under nodejs 16
           * use readFileSync instead
           */
          if (!innerLoadModuleCache[p]) {
            // return (await import(p, { assert: { type: 'json' } })).default;
            const content = readFileSync(p, {
              encoding: 'utf-8',
            });
            innerLoadModuleCache[p] = JSON.parse(content);
          }
          return innerLoadModuleCache[p];
        } else {
          return await import(pathToFileURL(p).href);
        }
      }
    } else {
      const content = readFileSync(p, {
        encoding: 'utf-8',
      });
      return JSON.parse(content);
    }
  } catch (err) {
    if (!options.safeLoad) {
      throw err;
    } else {
      if (options.warnOnLoadError && err.code !== 'MODULE_NOT_FOUND') {
        console.warn(err);
      }
      debug(`[core]: SafeLoadModule Warning\n\n${err.message}\n`);
      return undefined;
    }
  }
};

/**
 * load module sync, and it must be commonjs mode
 * @param p
 * @param options
 */
export const loadModuleSync = (
  p: string,
  options: {
    enableCache?: boolean;
    safeLoad?: boolean;
    warnOnLoadError?: boolean;
  } = {}
) => {
  options.enableCache = options.enableCache ?? true;
  options.safeLoad = options.safeLoad ?? false;

  if (p.startsWith(`.${sep}`) || p.startsWith(`..${sep}`)) {
    p = resolve(dirname(module.parent.filename), p);
  }

  try {
    if (options.enableCache) {
      return require(p);
    } else {
      const content = readFileSync(p, {
        encoding: 'utf-8',
      });
      return JSON.parse(content);
    }
  } catch (err) {
    if (!options.safeLoad) {
      throw err;
    } else {
      if (options.warnOnLoadError && err.code !== 'MODULE_NOT_FOUND') {
        console.warn(err);
      }
      debug(`[core]: SafeLoadModule Warning\n\n${err.message}\n`);
      return undefined;
    }
  }
};

/**
 *  @example
 *  safelyGet(['a','b'],{a: {b: 2}})  // => 2
 *  safelyGet(['a','b'],{c: {b: 2}})  // => undefined
 *  safelyGet(['a','1'],{a: {"1": 2}})  // => 2
 *  safelyGet(['a','1'],{a: {b: 2}})  // => undefined
 *  safelyGet('a.b',{a: {b: 2}})  // => 2
 *  safelyGet('a.b',{c: {b: 2}})  // => undefined
 *  @since 2.0.0
 */
export function safelyGet(
  list: string | string[],
  obj?: Record<string, unknown>
): any {
  if (arguments.length === 1) {
    return (_obj: Record<string, unknown>) => safelyGet(list, _obj);
  }

  if (typeof obj === 'undefined' || typeof obj !== 'object' || obj === null) {
    return void 0;
  }
  const pathArrValue = typeof list === 'string' ? list.split('.') : list;
  let willReturn: any = obj;

  for (const key of pathArrValue) {
    if (typeof willReturn === 'undefined' || willReturn === null) {
      return void 0;
    } else if (typeof willReturn !== 'object') {
      return void 0;
    }
    willReturn = willReturn[key];
  }

  return willReturn;
}

/**
 * 剔除 @ 符号
 * @param provideId provideId
 * @since 2.0.0
 */
export function parsePrefix(provideId: string) {
  if (provideId.includes('@')) {
    return provideId.slice(1);
  }
  return provideId;
}

export function getUserHome() {
  return process.env[process.platform === 'win32' ? 'USERPROFILE' : 'HOME'];
}

export function joinURLPath(...strArray) {
  strArray = strArray.filter(item => !!item);
  if (strArray.length === 0) {
    return '';
  }
  let p = posix.join(...strArray);
  p = p.replace(/\/+$/, '');
  if (!/^\//.test(p)) {
    p = '/' + p;
  }
  return p;
}

/**
 * 代理目标所有的原型方法，不包括构造器和内部隐藏方法
 * @param derivedCtor
 * @param constructors
 * @param otherMethods
 * @since 2.0.0
 */
export function delegateTargetPrototypeMethod(
  derivedCtor: any,
  constructors: any[],
  otherMethods?: string[]
) {
  constructors.forEach(baseCtor => {
    if (baseCtor.prototype) {
      Object.getOwnPropertyNames(baseCtor.prototype).forEach(name => {
        if (
          name !== 'constructor' &&
          !/^_/.test(name) &&
          !derivedCtor.prototype[name]
        ) {
          derivedCtor.prototype[name] = function (...args) {
            return this.instance[name](...args);
          };
        }
      });
    }
  });
  if (otherMethods) {
    delegateTargetMethod(derivedCtor, otherMethods);
  }
}

/**
 * 代理目标所有的原型方法，包括原型链，不包括构造器和内部隐藏方法
 * @param derivedCtor
 * @param constructor
 * @since 3.0.0
 */
export function delegateTargetAllPrototypeMethod(
  derivedCtor: any,
  constructor: any
) {
  do {
    delegateTargetPrototypeMethod(derivedCtor, [constructor]);
    constructor = Object.getPrototypeOf(constructor);
  } while (constructor);
}

/**
 * 代理目标原型上的特定方法
 * @param derivedCtor
 * @param methods
 * @since 2.0.0
 */
export function delegateTargetMethod(derivedCtor: any, methods: string[]) {
  methods.forEach(name => {
    derivedCtor.prototype[name] = function (...args) {
      return this.instance[name](...args);
    };
  });
}

/**
 * 代理目标原型属性
 * @param derivedCtor
 * @param properties
 * @since 2.0.0
 */
export function delegateTargetProperties(
  derivedCtor: any,
  properties: string[]
) {
  properties.forEach(name => {
    Object.defineProperty(derivedCtor.prototype, name, {
      get() {
        return this.instance[name];
      },
    });
  });
}

/**
 * 获取当前的时间戳
 * @since 2.0.0
 * @param timestamp
 */
export const getCurrentDateString = (timestamp: number = Date.now()) => {
  const d = new Date(timestamp);
  return `${d.getFullYear()}-${(d.getMonth() + 1)
    .toString()
    .padStart(2, '0')}-${d.getDate().toString().padStart(2, '0')}`;
};

/**
 *
 * @param message
 * @since 3.0.0
 */
export const deprecatedOutput = (message: string) => {
  console.warn('DeprecationWarning: ' + message);
};

/**
 * transform request object to definition type
 *
 * @param originValue
 * @param targetType
 * @since 3.0.0
 */
export const transformRequestObjectByType = (originValue: any, targetType?) => {
  if (
    targetType === undefined ||
    targetType === null ||
    targetType === Object ||
    typeof originValue === 'undefined'
  ) {
    return originValue;
  }

  switch (targetType) {
    case Number:
      return Number(originValue);
    case String:
      return String(originValue);
    case Boolean:
      if (originValue === '0' || originValue === 'false') {
        return false;
      }
      return Boolean(originValue);
    default:
      return originValue;
  }
};

export function toPathMatch(pattern) {
  if (typeof pattern === 'boolean') {
    return ctx => pattern;
  }
  if (typeof pattern === 'string') {
    const reg = PathToRegexpUtil.toRegexp(pattern.replace('*', '(.*)'));
    if (reg.global) reg.lastIndex = 0;
    return ctx => reg.test(ctx.path);
  }
  if (pattern instanceof RegExp) {
    return ctx => {
      if (pattern.global) pattern.lastIndex = 0;
      return pattern.test(ctx.path);
    };
  }
  if (typeof pattern === 'function') return pattern;
  if (Array.isArray(pattern)) {
    const matchs = pattern.map(item => toPathMatch(item));
    return ctx => matchs.some(match => match(ctx));
  }
  throw new MidwayCommonError(
    'match/ignore pattern must be RegExp, Array or String, but got ' + pattern
  );
}

export function pathMatching(options: {
  match?: IgnoreMatcher<any> | IgnoreMatcher<any>[];
  ignore?: IgnoreMatcher<any> | IgnoreMatcher<any>[];
  thisResolver?: any;
}) {
  options = options || {};
  if (options.match && options.ignore)
    throw new MidwayCommonError(
      'options.match and options.ignore can not both present'
    );
  if (!options.match && !options.ignore) return () => true;

  if (options.match && !Array.isArray(options.match)) {
    options.match = [options.match];
  }

  if (options.ignore && !Array.isArray(options.ignore)) {
    options.ignore = [options.ignore];
  }

  const createMatch = (ignoreMatcherArr: IgnoreMatcher<any>[]) => {
    const matchedArr = ignoreMatcherArr.map(item => {
      if (options.thisResolver) {
        return toPathMatch(item).bind(options.thisResolver);
      }
      return toPathMatch(item);
    });

    return ctx => {
      for (let i = 0; i < matchedArr.length; i++) {
        const matched = matchedArr[i](ctx);
        if (matched) {
          return true;
        }
      }
      return false;
    };
  };

  const matchFn = options.match
    ? createMatch(options.match as IgnoreMatcher<any>[])
    : createMatch(options.ignore as IgnoreMatcher<any>[]);

  return function pathMatch(ctx?) {
    const matched = matchFn(ctx);
    return options.match ? matched : !matched;
  };
}

/**
 * wrap function middleware with match and ignore
 * @param mw
 * @param options
 */
export function wrapMiddleware(mw: FunctionMiddleware<any, any>, options) {
  // support options.enable
  if (options.enable === false) return null;

  // support options.match and options.ignore
  if (!options.match && !options.ignore) return mw;
  const match = pathMatching(options);

  const fn = (ctx, next) => {
    if (!match(ctx)) return next();
    return mw(ctx, next);
  };
  fn._name = (mw as any)._name + 'middlewareWrapper';
  return fn;
}

function isOwnPropertyWritable(obj: any, prop: string): boolean {
  if (obj == null) return false;
  const type = typeof obj;
  if (type !== 'object' && type !== 'function') return false;
  return !!Object.getOwnPropertyDescriptor(obj, prop);
}

export function isIncludeProperty(obj: any, prop: string): boolean {
  while (obj) {
    if (isOwnPropertyWritable(obj, prop)) return true;
    obj = Object.getPrototypeOf(obj);
  }
  return false;
}

export function wrapAsync(handler) {
  return (...args) => {
    if (typeof args[args.length - 1] === 'function') {
      const callback = args.pop();
      if (handler.constructor.name !== 'AsyncFunction') {
        const err = new TypeError('Must be an AsyncFunction');
        return callback(err);
      }
      // 其他事件场景
      return handler.apply(handler, args).then(
        result => {
          callback(null, result);
        },
        err => {
          callback(err);
        }
      );
    } else {
      return handler.apply(handler, args);
    }
  };
}

export function sleep(sleepTime = 1000, abortController?: AbortController) {
  return new Promise<void>(resolve => {
    const timeoutHandler = setTimeout(() => {
      resolve();
    }, sleepTime);
    if (abortController) {
      abortController.signal.addEventListener('abort', () => {
        clearTimeout(timeoutHandler);
      });
    }
  });
}

const STRIP_COMMENTS = /((\/\/.*$)|(\/\*[\s\S]*?\*\/))/gm;

/**
 * get parameter name from function
 * @param func
 */
export function getParamNames(func): string[] {
  const fnStr = func.toString().replace(STRIP_COMMENTS, '');
  let result = fnStr
    .slice(fnStr.indexOf('(') + 1, fnStr.indexOf(')'))
    .split(',')
    .map(content => {
      return content.trim().replace(/\s?=.*$/, '');
    });

  if (result.length === 1 && result[0] === '') {
    result = [];
  }
  return result;
}

/**
 * generate a lightweight 32 bit random id, enough for ioc container
 */
export function generateRandomId(): string {
  // => f9b327e70bbcf42494ccb28b2d98e00e
  return crypto.randomBytes(16).toString('hex');
}

export function merge(target: any, src: any) {
  if (!target) {
    target = src;
    src = null;
  }
  if (!target) {
    return null;
  }
  if (Array.isArray(target)) {
    return target.concat(src || []);
  }
  if (typeof target === 'object') {
    return Object.assign({}, target, src);
  }
  throw new Error('can not merge meta that type of ' + typeof target);
}

export function toAsyncFunction<T extends (...args) => any>(
  method: T
): (...args: Parameters<T>) => Promise<ReturnType<T>> {
  if (Types.isAsyncFunction(method)) {
    return method as any;
  } else {
    return async function (...args) {
      return Promise.resolve(method.call(this, ...args));
    } as any;
  }
}

export function isTypeScriptEnvironment() {
  const TS_MODE_PROCESS_FLAG: string = process.env.MIDWAY_TS_MODE;
  if ('false' === TS_MODE_PROCESS_FLAG) {
    return false;
  }
  // eslint-disable-next-line node/no-deprecated-api
  return TS_MODE_PROCESS_FLAG === 'true' || !!require.extensions['.ts'];
}

function getFileNameWithSuffix(fileName: string) {
  return isTypeScriptEnvironment() ? `${fileName}.ts` : `${fileName}.js`;
}

export function isConfigurationExport(exports): boolean {
  return (
    (Types.isClass(exports) &&
      MetadataManager.hasOwnMetadata(CONFIGURATION_KEY, exports)) ||
    (Types.isObject(exports) &&
      MetadataManager.hasOwnMetadata(CONFIGURATION_OBJECT_KEY, exports))
  );
}

export async function findProjectEntryFile(
  appDir: string,
  baseDir: string,
  loadMode: 'commonjs' | 'esm'
) {
  /**
   * 查找常用文件中的 midway 入口，入口文件包括 Configuration 对象或者 defineConfiguration 函数
   */
  async function containsConfiguration(filePath: string) {
    // 加载文件
    const content = await loadModule(filePath, {
      safeLoad: true,
      loadMode,
      warnOnLoadError: true,
    });

    if (content && isConfigurationExport(content)) {
      debug(`[core]: find configuration file ${filePath}`);
      return content;
    } else {
      for (const m in content) {
        const module = content[m];
        if (isConfigurationExport(module)) {
          debug(`[core]: find configuration file ${filePath}`);
          return content;
        }
      }
    }
  }

  // 1. 找 src/configuration.ts 或 src/configuration.js
  const configurationFile = await containsConfiguration(
    join(baseDir, getFileNameWithSuffix('configuration'))
  );

  if (configurationFile) {
    return configurationFile;
  }

  // 2. 找 src/index.ts 或 src/index.js
  const indexFile = await containsConfiguration(
    join(baseDir, getFileNameWithSuffix('index'))
  );
  if (indexFile) {
    return indexFile;
  }

  // 3. 找 package.json 中的 main 字段
  if (appDir) {
    const pkgJSON = await loadModule(join(appDir, 'package.json'), {
      safeLoad: true,
      enableCache: false,
    });
    if (pkgJSON?.['main']) {
      const configuration = await containsConfiguration(
        normalizePath(appDir, pkgJSON['main'])
      );
      if (configuration) {
        return configuration;
      }
    }
  }
}

export function findProjectEntryFileSync(appDir: string, baseDir: string) {
  /**
   * 查找常用文件中的 midway 入口，入口文件包括 Configuration 对象或者 defineConfiguration 函数
   */
  function containsConfiguration(filePath: string) {
    // 加载文件
    const content = loadModuleSync(filePath, {
      safeLoad: true,
      warnOnLoadError: true,
    });
    if (content && isConfigurationExport(content)) {
      debug(`[core]: find configuration file ${filePath}`);
      return content;
    } else {
      for (const m in content) {
        const module = content[m];
        if (isConfigurationExport(module)) {
          debug(`[core]: find configuration file ${filePath}`);
          return content;
        }
      }
    }
  }

  // 1. 找 src/configuration.ts 或 src/configuration.js
  const configurationFile = containsConfiguration(
    join(baseDir, getFileNameWithSuffix('configuration'))
  );

  if (configurationFile) {
    return configurationFile;
  }

  // 2. 找 src/index.ts 或 src/index.js
  const indexFile = containsConfiguration(
    join(baseDir, getFileNameWithSuffix('index'))
  );
  if (indexFile) {
    return indexFile;
  }

  if (appDir) {
    // 3. 找 package.json 中的 main 字段
    const pkgJSON = loadModuleSync(join(appDir, 'package.json'), {
      safeLoad: true,
      enableCache: false,
    });
    if (pkgJSON?.['main']) {
      const configuration = containsConfiguration(
        normalizePath(appDir, pkgJSON['main'])
      );
      if (configuration) {
        return configuration;
      }
    }
  }
}

export const Utils = {
  sleep,
  getParamNames,
  camelCase,
  pascalCase,
  randomUUID,
  generateRandomId,
  toAsyncFunction,
  safeStringify,
  safeParse,
  isTypeScriptEnvironment,
};
