import { spawn } from 'child_process';
import { createInterface } from 'readline';

async function runTest(scriptPath, label) {
  return new Promise((resolve, reject) => {
    const results = [];
    const process = spawn('node', ['--expose-gc', scriptPath]);
    const rl = createInterface({ input: process.stdout });

    console.log(`开始运行${label}...`);

    rl.on('line', (line) => {
      // 只捕获性能相关的数据
      if (line.includes('本轮耗时') || 
          line.includes('平均每次') || 
          line.includes('总计耗时') ||
          line.includes('heapUsed')) {
        results.push(line.trim());
      }
    });

    process.stderr.on('data', (data) => {
      console.error(`${label} 错误: ${data}`);
    });

    process.on('close', (code) => {
      resolve(results);
    });
    
    process.on('error', (err) => {
      reject(err);
    });
  });
}

console.log('=== Compose 性能对比测试 ===\n');

function formatResults(original, newVer, diff) {
  // 格式化数值，左对齐
  const format = (value, unit) => `${value.toFixed(2)}${unit}`.padEnd(10);
  
  const formatLine = (label, orig, origUnit, next, nextUnit, diffVal) => {
    const col1 = label.padEnd(20);  // 第一列：标签
    const col2 = `${format(orig, origUnit)} (旧)`.padEnd(20);  // 第二列：旧值
    const col3 = `${format(next, nextUnit)} (新)`.padEnd(20);  // 第三列：新值
    const col4 = `[提升: ${diffVal}%]`;  // 第四列：提升
    return `${col1}${col2}${col3}${col4}`;
  };

  return [
    formatLine('本轮耗时', original.roundTime, 'ms', newVer.roundTime, 'ms', diff.roundTime),
    formatLine('平均每次', original.avgTime, 'ms', newVer.avgTime, 'ms', diff.avgTime),
    formatLine('总计耗时', original.totalTime, 'ms', newVer.totalTime, 'ms', diff.totalTime),
    formatLine('堆内存', original.heapUsed, 'MB', newVer.heapUsed, 'MB', diff.heapUsed)
  ].join('\n');
}

try {
  const [originalResults, newResults] = await Promise.all([
    runTest('./test-original.mjs', '原始版本'),
    runTest('./test-new.mjs', '新版本')
  ]);

  console.log('\n=== 性能对比结果 ===\n');

  const minLength = Math.min(
    originalResults.length - (originalResults.length % 4),
    newResults.length - (newResults.length % 4)
  );

  for (let i = 0; i < minLength; i += 4) {
    const checkpoint = (i / 4 + 1) * 10000;
    console.log(`\n检查点 ${checkpoint.toLocaleString()} 次:`);
    
    // 解析原始数据
    const original = {
      roundTime: parseFloat(originalResults[i].match(/[\d.]+/)[0]),
      avgTime: parseFloat(originalResults[i + 1].match(/[\d.]+/)[0]),
      totalTime: parseFloat(originalResults[i + 2].match(/[\d.]+/)[0]),
      heapUsed: parseFloat(originalResults[i + 3].match(/[\d.]+/)[0])
    };

    // 解析新版本数据
    const newVer = {
      roundTime: parseFloat(newResults[i].match(/[\d.]+/)[0]),
      avgTime: parseFloat(newResults[i + 1].match(/[\d.]+/)[0]),
      totalTime: parseFloat(newResults[i + 2].match(/[\d.]+/)[0]),
      heapUsed: parseFloat(newResults[i + 3].match(/[\d.]+/)[0])
    };

    // 计算性能差异
    const diff = {
      roundTime: ((original.roundTime - newVer.roundTime) / original.roundTime * 100).toFixed(2),
      avgTime: ((original.avgTime - newVer.avgTime) / original.avgTime * 100).toFixed(2),
      totalTime: ((original.totalTime - newVer.totalTime) / original.totalTime * 100).toFixed(2),
      heapUsed: ((original.heapUsed - newVer.heapUsed) / original.heapUsed * 100).toFixed(2)
    };

    console.log(formatResults(original, newVer, diff));
  }

} catch (error) {
  console.error('测试执行出错:', error);
} 