/**
 * 计算任务 Worker (TypeScript 版本)
 * 用于测试 .ts 文件自动加载
 */
export async function computeTs(payload?: { value: number }) {
  return (payload?.value || 0) * 3;
}

