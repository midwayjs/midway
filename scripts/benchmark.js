'use strict';

const { spawn } = require('child_process');
const autocannon = require('autocannon');

function wait(delaySec) {
  return new Promise(resolve => {
    setTimeout(resolve, delaySec * 1000);
  });
}

const format = function (bytes) {
  return (bytes / 1024 / 1024).toFixed(2) + ' MB';
};

const cannon = () => {
  return new Promise((resolve, reject) => {
    autocannon(
      {
        url: 'http://127.0.0.1:7001',

        connections: 100,
        pipelining: 2,
        duration: 30,
      },
      (err, results) => {
        if (err) {
          return reject(err);
        }
        return resolve(results);
      }
    );
  });
};

(async () => {
  const child = spawn('node', ['--expose-gc', 'start.js'], {
    cwd: __dirname,
    stdio: ['inherit', 'inherit', 'inherit', 'ipc'],
  });

  let callback = () => {};
  child.on('message', data => {
    if (data.action === 'collect_mem_result') {
      return callback(data.data);
    }
  });

  async function collectMem() {
    return new Promise((resolve, reject) => {
      callback = resolve;
      child.send({ action: 'collect_mem' });
    });
  }

  console.log(`Current pid is ${child.pid}`);
  const firstMem = await collectMem();
  console.log(
    `  - first memory  (init  test), rss=${format(firstMem.rss)}, heapUsed=${format(
      firstMem.heapUsed
    )}`
  );

  child.on('error', err => {
    console.error(err);
  });

  child.on('exit', (code, signal) => {
    console.log(`Exited with code ${code} and signal ${signal}`);
  });

  console.log('Initialization after 5s...');
  await wait(5);

  console.log('Running benchmark...');
  const results = await cannon();
  console.log(`QPS:  ${results.requests.average}`);

  // retry qps.
  if (results.requests.average < 3000) {
    throw new Error('Benchmark failed, QPS is too low');
  }

  await wait(10);

  // 过 10s 采集一次内存
  const secondMem = await collectMem();
  console.log(
    `  - second memory (before gc1), rss=${format(secondMem.rss)}, heapUsed=${format(
      secondMem.heapUsed
    )}`
  );

  child.send({ action: 'gc' })
  await wait(10);

  // gc 后采集一次内存
  const thirdMem = await collectMem();
  console.log(
    `  - third memory  (after  gc1), rss=${format(thirdMem.rss)}, heapUsed =${format(
      thirdMem.heapUsed
    )}`
  );

  // 第一次检查，gc 后和初始化持平
  const ratio1 = +Math.abs(thirdMem.heapUsed / firstMem.heapUsed).toFixed(2);
  console.log(`ratio1: ${ratio1}`);
  if (ratio1 > 1.1) {
    throw new Error('memory leak warning')
  }

  // 继续压测 30s
  console.log('Running benchmark 2...');
  const secondResult = await cannon();
  console.log(`QPS:  ${secondResult.requests.average}`);

  if (results.requests.average < 3000) {
    throw new Error('Benchmark failed, QPS is too low');
  }

  await wait(10);

  const fourthMem = await collectMem();
  console.log(
    `  - fourth memory (before gc2), rss=${format(
      fourthMem.rss
    )}, heapUsed=${format(fourthMem.heapUsed)}`
  );

  child.send({ action: 'gc' });
  await wait(10);

  // gc 后采集一次内存
  const fifthMem = await collectMem();
  console.log(
    `  - fifth  memory (after  gc2), rss=${format(fifthMem.rss)}, heapUsed =${format(
      fifthMem.heapUsed
    )}`
  );

  // 第二次检查，第二次 gc 中的堆内存和第一次 gc 持平，gc 前的数值不定，容错率大一些
  const ratio2 = +Math.abs(fourthMem.heapUsed / secondMem.heapUsed).toFixed(2);
  console.log(`ratio2: ${ratio2}`);
  if (ratio2 > 1.5) {
    throw new Error('memory leak warning')
  }

  // 第三次检查，第三次 gc 之后和第一次 gc 结果持平
  if (Math.abs(fifthMem.heapUsed / thirdMem.heapUsed) > 1.2) {
    throw new Error('memory leak warning');
  }

  child.kill();
  process.exit(0);
})().catch(err => {
  console.error(err);
  process.exit(1);
});
