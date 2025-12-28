'use strict';

const path = require('path');
const fs = require('fs');
const { workerData, threadId } = require('worker_threads');
const { FunctionalConfiguration } = require('@midwayjs/core/functional');
const {
  initializeGlobalApplicationContext,
  MidwayFrameworkService,
} = require('@midwayjs/core');
const { loggers } = require('@midwayjs/logger');

/**
 * 解析 worker 文件路径
 * 支持 .ts 和 .js，自动查找存在的文件
 */
function resolveWorkerFile(workerFile) {
  // 如果路径已经有扩展名且文件存在，直接返回
  if (fs.existsSync(workerFile)) {
    return workerFile;
  }

  const ext = path.extname(workerFile);
  const basePath = ext ? workerFile.slice(0, -ext.length) : workerFile;

  // 尝试的扩展名顺序：.js -> .ts -> .mjs -> .cjs
  const extensions = ['.js', '.ts', '.mjs', '.cjs'];

  for (const tryExt of extensions) {
    const tryPath = basePath + tryExt;
    if (fs.existsSync(tryPath)) {
      return tryPath;
    }
  }

  // 都找不到，返回原路径，让 require 报错
  return workerFile;
}

// 从 workerData 获取 fullpath 并加载模块
const {
  _fullPath: fullpath,
  _mainAppDir: mainAppDir,
  _isDevelopmentEnvironment: isDevelopmentEnvironment,
} = workerData || {};
let workerModule = null;
let resolvedFile = null;
let baseDir = null;

if (isDevelopmentEnvironment) {
  process.env['MIDWAY_LOGGER_WRITEABLE_DIR'] =
    process.env['MIDWAY_LOGGER_WRITEABLE_DIR'] ?? mainAppDir;
}

if (fullpath) {
  resolvedFile = resolveWorkerFile(fullpath);
  baseDir = path.dirname(resolvedFile);

  // 如果是 .ts 文件，注册 ts-node 以支持 TypeScript
  if (resolvedFile.endsWith('.ts')) {
    try {
      // 查找 worker 目录中的 tsconfig.json
      const workerTsConfig = path.join(baseDir, 'tsconfig.json');
      const hasWorkerTsConfig = fs.existsSync(workerTsConfig);
      
      /* eslint-disable-next-line node/no-extraneous-require */
      require('ts-node').register(
        hasWorkerTsConfig
          ? { project: workerTsConfig }
          : {
              transpileOnly: true,
              compilerOptions: {
                module: 'commonjs',
                moduleResolution: 'node',
              },
            }
      );
    } catch (err) {
      // ts-node 可能不存在（生产环境），忽略错误
      // 如果真的需要 ts-node 但没安装，后续 require 会失败并报错
    }
  }

  workerModule = require(resolvedFile);
}

let applicationContext = null;
let framework = null;

/**
 * Worker Thread 启动入口
 */
module.exports = async function workerEntry(message) {
  const { handler, payload } = message;

  if (!workerModule) {
    throw new Error('workerData.fullpath is required');
  }

  // 支持 FunctionalConfiguration 的情况
  if (
    applicationContext ||
    workerModule.default instanceof FunctionalConfiguration
  ) {
    if (!applicationContext) {
      applicationContext = await initializeGlobalApplicationContext({
        baseDir,
        loggerFactory: loggers,
      });
      // 获取 PiscinaWorkerFramework
      const midwayFrameworkService = await applicationContext.getAsync(
        MidwayFrameworkService
      );
      framework = midwayFrameworkService.getMainFramework();
      if (!framework) {
        throw new Error('Framework instance not found in application context');
      }
      framework
        .getLogger()
        .info(
          `[piscina:worker:${threadId}]: ApplicationContext initialized in worker`
        );
    }

    framework
      .getLogger()
      .info(
        `[piscina:worker:${threadId}]: Executing task handler "${payload.handler}" with payload`,
        payload.data
      );
    // 执行容器中的任务
    return await framework.executeTask(payload.handler, payload.data);
  }

  // 获取处理函数
  let fn;

  // 1. 如果指定了 handler，先查找具名导出
  if (handler && workerModule[handler]) {
    fn = workerModule[handler];
  }

  // 2. 如果没找到，尝试 default export
  else if (typeof workerModule.default === 'function') {
    fn = workerModule.default;
  }
  // 3. 如果 workerModule 本身是函数（CommonJS）
  else if (typeof workerModule === 'function') {
    fn = workerModule;
  }

  // 4. 都找不到，报错
  else {
    if (handler) {
      throw new Error(
        `Handler "${handler}" not found and no default function in "${resolvedFile}"`
      );
    } else {
      throw new Error(
        `No handler specified and no default function found in "${resolvedFile}"`
      );
    }
  }

  if (typeof fn !== 'function') {
    throw new Error(`Handler is not a function in "${resolvedFile}"`);
  }

  return await fn(payload);
};
