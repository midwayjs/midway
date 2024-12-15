// 测试重构版本
function dispatch(i, middlewareArr) {
  if (i === middlewareArr.length) return Promise.resolve();
  const fn = middlewareArr[i];
  return Promise.resolve(
    fn({}, () => dispatch(i + 1, middlewareArr))
  );
}

function createNewCompose() {
  return (context, next) => {
    // 创建100个中间件
    const newMiddlewareArr = Array(100).fill(null).map(() => 
      async (ctx, next) => {
        await next();
      }
    );

    return dispatch(0, newMiddlewareArr);
  };
}
// 格式化内存数据
function formatMemory(bytes) {
  return (bytes / 1024 / 1024).toFixed(2) + ' MB';
}

// 格式化内存使用情况
function formatMemoryUsage(memoryUsage) {
  return {
    heapUsed: formatMemory(memoryUsage.heapUsed),    // 实际使用的堆内存
    heapTotal: formatMemory(memoryUsage.heapTotal),  // 总堆内存
    rss: formatMemory(memoryUsage.rss),              // 常驻集大小
    external: formatMemory(memoryUsage.external)      // V8 外部内存
  };
}

const compose = createNewCompose();

console.log('\n=== 重构版本测试 ===');
console.log('初始内存使用情况:');
console.table(formatMemoryUsage(process.memoryUsage()));

let count = 0;
const startTime = process.hrtime.bigint();
let lastTime = startTime;

async function run() {
  while (count < 100000) {
    await compose({});
    count++;
    
    if (count % 10000 === 0) {
      const currentTime = process.hrtime.bigint();
      const totalTime = Number(currentTime - startTime) / 1e6; // 转换为毫秒
      const intervalTime = Number(currentTime - lastTime) / 1e6;
      lastTime = currentTime;

      console.log(`\n执行 ${count.toLocaleString()} 次后的性能数据:`);
      console.log(`本轮耗时: ${intervalTime.toFixed(2)}ms`);
      console.log(`平均每次: ${(intervalTime / 10000).toFixed(3)}ms`);
      console.log(`总计耗时: ${totalTime.toFixed(2)}ms`);
      console.table(formatMemoryUsage(process.memoryUsage()));
    }
  }
}

run();