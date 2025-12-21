'use strict';

/**
 * 计算任务 Worker
 * 用于 runInBackgroundWithFile 测试
 */
async function compute(payload) {
  return (payload?.value || 0) * 2;
}

module.exports = { compute };

