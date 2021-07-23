import { ServerlessAbstractRuntime, getHandlerMeta } from '../src';
import { join } from 'path';
import { exists } from 'mz/fs';

export const isTsEnv = () => {
  const TS_MODE_PROCESS_FLAG = process.env.MIDWAY_TS_MODE;
  if ('false' === TS_MODE_PROCESS_FLAG) {
    return false;
  }
  // eslint-disable-next-line node/no-deprecated-api
  return TS_MODE_PROCESS_FLAG === 'true' || !!require.extensions['.ts'];
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

export class TestRuntime extends ServerlessAbstractRuntime {
  async invokeInitHandler(...args) {
    let func;
    const entryDir = this.propertyParser.getEntryDir();
    const { fileName, handler } = getHandlerMeta(
      this.propertyParser.getInitHandler()
    );
    if (await fileExists(entryDir, fileName)) {
      try {
        func = getHandlerMethod(join(entryDir, fileName), handler);
        this.debugLogger.log('invoke init handler');
        if (func) {
          this.debugLogger.log('found handler and call');
          return await new Promise((resolve, reject) => {
            const timer = setTimeout(() => {
              // TODO error stack
              reject(new Error('timeout'));
            }, Number(this.propertyParser.getInitTimeout()));
            Promise.resolve(func.call(this, this, ...args))
              .then(res => {
                clearTimeout(timer);
                resolve(res);
              })
              .catch(err => {
                clearTimeout(timer);
                reject(err);
              });
          });
        }
      } catch (err) {
        err.message = `function init error with: ${err.message}`;
        throw err;
      }
    } else {
      this.debugLogger.log('no init handler found');
    }
  }

  async invokeDataHandler(...args) {
    const entryDir = this.propertyParser.getEntryDir();
    const { fileName, handler } = getHandlerMeta(
      this.propertyParser.getFunctionHandler()
    );
    let error = new Error(`invoke handler not found: ${fileName}.${handler}`);
    try {
      let func;
      const flag = await fileExists(entryDir, fileName);
      if (flag) {
        this.debugLogger.log('invoke data handler');
        func = getHandlerMethod(join(entryDir, fileName), handler);
      }
      if (flag && func) {
        this.debugLogger.log('found handler and call');
        return func.apply(this, args);
      } else {
        return this.defaultInvokeHandler(...args);
      }
    } catch (err) {
      error = err;
      this.logger.error(err);
    }

    return Promise.reject(error);
  }
}
