export interface InvokeOptions {
  functionDir?: string; // 函数所在目录
  functionName?: string; // 函数名
  data?: any[]; // 函数入参
  trigger?: string; // 触发器
  handler?: string;
  sourceDir?: string; // 一体化目录结构下，函数的目录，比如 src/apis，这个影响到编译
  clean?: boolean; // 清理调试目录
  incremental?: boolean; // 增量编译
  verbose?: boolean | string; // 输出更多信息
  getFunctionList?: boolean; // 获取函数列表
}