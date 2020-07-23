import { existsSync, remove } from 'fs-extra';
import { join } from 'path';
import { type } from 'os';
import { InvokeOptions } from './interface';
export const exportMidwayFaaS = (() => {
  const midwayModuleName = process.env.MidwayModuleName || '@midwayjs/faas';
  const faasPath = join(process.cwd(), './node_modules/', midwayModuleName);
  if (existsSync(faasPath)) {
    return require(faasPath);
  } else {
    try {
      return require(midwayModuleName);
    } catch (e) {
      return { FaaSStarter: class DefaulltMidwayFaasStarter {} };
    }
  }
})();

export const FaaSStarterClass = exportMidwayFaaS.FaaSStarter;

// 清理某个目标目录
export const cleanTarget = async (p: string) => {
  if (existsSync(p)) {
    await remove(p);
  }
};

// 格式化调用的返回值结果
export const formatInvokeResult = result => {
  if (result.success) {
    return result.result;
  } else {
    throw result.err;
  }
};

// 转换传递给 invoke 方法的参数 到 invoke plugin 所需要的参数
export const optionsToInvokeParams = (options: InvokeOptions) => {
  return {
    function: options.functionName,
    data: options.data,
    trigger: options.trigger,
    handler: options.handler,
    sourceDir: options.sourceDir,
    clean: options.clean,
    incremental: options.incremental,
    verbose: options.verbose,
    resultType: 'store',
  };
};

const commonLock: any = {};
export enum LOCK_TYPE {
  INITIAL,
  WAITING,
  COMPLETE,
}

export const getLock = lockKey => {
  if (!commonLock[lockKey]) {
    commonLock[lockKey] = {
      lockType: LOCK_TYPE.INITIAL,
      lockData: {},
    };
  }
  return commonLock[lockKey];
};

export const setLock = (lockKey, status, data?) => {
  if (!commonLock[lockKey]) {
    return;
  }
  commonLock[lockKey].lockType = status;
  commonLock[lockKey].lockData = data;
};

export const waitForLock = async (lockKey, count?) => {
  count = count || 0;
  return new Promise(resolve => {
    if (count > 100) {
      return resolve();
    }
    const { lockType, lockData } = getLock(lockKey);
    if (lockType === LOCK_TYPE.WAITING) {
      setTimeout(() => {
        waitForLock(lockKey, count + 1).then(resolve);
      }, 300);
    } else {
      resolve(lockData);
    }
  });
};

export const checkIsTsMode = () => {
  // eslint-disable-next-line node/no-deprecated-api
  return !!require.extensions['.ts'];
};

export const getPlatformPath = p => {
  if (type() === 'Windows_NT') {
    return p.replace(/\\/g, '\\\\');
  }
  return p;
};
