'use strict';

const path = require('path');
const fs = require('fs');

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

/**
 * Worker Thread 启动入口
 * 加载指定的 worker 文件并执行
 */
module.exports = async function workerEntry(message) {
  const { workerFile, handler, payload } = message;

  if (!workerFile) {
    throw new Error('workerFile is required');
  }

  // 解析文件路径（自动处理 .ts/.js）
  const resolvedFile = resolveWorkerFile(workerFile);

  // 加载 worker 文件
  // 注意：如果是 .ts 文件，需要 ts-node 或 esbuild-register 已加载
  const workerModule = require(resolvedFile);

  // 获取处理函数
  let fn;
  if (handler) {
    fn = workerModule[handler];
    if (!fn) {
      throw new Error(`Handler "${handler}" not found in "${resolvedFile}"`);
    }
  } else if (typeof workerModule === 'function') {
    // 默认导出是函数
    fn = workerModule;
  } else if (typeof workerModule.default === 'function') {
    // ES module default export
    fn = workerModule.default;
  } else {
    throw new Error(
      `No handler specified and no default function found in "${resolvedFile}"`
    );
  }

  if (typeof fn !== 'function') {
    throw new Error(`Handler is not a function in "${resolvedFile}"`);
  }

  return await fn(payload);
};
