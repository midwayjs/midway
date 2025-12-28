'use strict';

/**
 * 错误测试 Worker
 */
function throwError() {
  throw new Error('Intentional error from worker');
}

module.exports = { throwError };

