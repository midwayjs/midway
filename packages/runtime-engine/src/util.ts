import { exists } from 'mz/fs';
import { join } from 'path';

export const isTsEnv = () => {
  const TS_MODE_PROCESS_FLAG: string = process.env.MIDWAY_TS_MODE;
  if ('false' === TS_MODE_PROCESS_FLAG) {
    return false;
  }
  return TS_MODE_PROCESS_FLAG === 'true' || !!require.extensions['.ts'];
};

export const asyncWrapper = handler => {
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
};

export const isDebug = () => {
  return process.env['FAAS_DEBUG'] === 'true';
};

/**
 * This is an assign function that copies full descriptors
 * @param {Object} target 合并的目标对象
 * @param {Object} sources 合并的原对象
 * @return {*} 合并的结果对象
 */
export const completeAssign = function(...sources) {
  const target = sources.shift();

  sources.forEach(source => {
    const descriptors = Object.keys(source).reduce((descriptors, key) => {
      if (Object.getOwnPropertyDescriptor(target, key)) {
        // delete target[key];
      }
      descriptors[key] = Object.getOwnPropertyDescriptor(source, key);
      return descriptors;
    }, {});
    // by default, Object.assign copies enumerable Symbols too
    /* istanbul ignore next */
    Object.getOwnPropertySymbols(source).forEach(sym => {
      const descriptor = Object.getOwnPropertyDescriptor(source, sym);
      if (descriptor.enumerable) {
        descriptors[sym] = descriptor;
      }
    });

    // 在 copy 属性时不执行 get/set 方法
    for (const name in descriptors) {
      if (Object.getOwnPropertyDescriptor(target, name)) {
        // console.debug('Property: "%s" already exists, will be override', name);
      }
      if (
        /^(before|after)\w+/.test(name) &&
        typeof descriptors[name].value === 'function'
      ) {
        if (!target['handlerStore']) {
          Object.defineProperty(target, 'handlerStore', {
            value: new Map(),
          });
        }

        if (!target['handlerStore'].has(name + 'Handler')) {
          target['handlerStore'].set(name + 'Handler', []);
        }

        target['handlerStore']
          .get(name + 'Handler')
          .push(descriptors[name].value);
      } else {
        Object.defineProperty(target, name, descriptors[name]);
      }
    }
  });
  return target;
};

/**
 * get handler function with file path and method name
 * @param filePath
 * @param handler
 */
export const getHandlerMethod = (filePath, handler) => {
  const mod = require(filePath);
  if (mod && mod[handler]) {
    return mod[handler].bind(mod);
  }
};

/**
 * parse handler file name and method name
 * @param handlerName
 */
export const getHandlerMeta = (
  handlerName
): { fileName: string; handler: string } => {
  if (/\./.test(handlerName)) {
    const meta = handlerName.split('.');
    return { fileName: meta[0], handler: meta[1] };
  } else {
    // error
  }
};

export const fileExists = (entryDir, fileName) => {
  const jsFile = join(entryDir, fileName + '.js');
  const tsFile = join(entryDir, fileName + '.ts');
  if (isTsEnv()) {
    return exists(tsFile);
  } else {
    /* istanbul ignore next */
    return exists(jsFile);
  }
};
