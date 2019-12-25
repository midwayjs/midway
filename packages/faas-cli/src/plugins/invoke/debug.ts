export const faasDebug = faasHandle => {
  // 下一步将进入函数
  // faasHandler 为函数的 handle方法
  return faasHandle();
};
