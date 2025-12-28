/**
 * 计算任务 Worker (TypeScript 版本)
 * 用于测试 .ts 文件自动加载
 */
export async function compute(payload?: { value: number }) {
  return (payload?.value || 0) * 2;
}

/**
 * 长时间运行的任务（用于测试 abort）
 */
export async function longRunning(payload?: { duration?: number }) {
  const { duration = 5000 } = payload || {};
  await new Promise(resolve => setTimeout(resolve, duration));
  return 'completed';
}
