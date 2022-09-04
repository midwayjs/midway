#!/usr/bin/env zx
import assert from 'node:assert'
import { spawn } from 'node:child_process'
import autocannon from 'autocannon'


const api = argv.api ?? ''

const format = function (bytes) {
  return (bytes / 1024 / 1024).toFixed(2) + ' MB'
};

const url = `http://127.0.0.1:7001/${api}`

const cannon = () => {
  return new Promise((resolve, reject) => {
    autocannon(
      {
        url,
        connections: 100,
        pipelining: 2,
        duration: 30,
      },
      (err, results) => {
        if (err) {
          return reject(err)
        }
        return resolve(results)
      }
    )
  })
}

const child = spawn('node', ['--expose-gc', 'start.js'], {
  cwd: __dirname,
  stdio: ['inherit', 'inherit', 'inherit', 'ipc'],
  env: {
    ...process.env,
    // NODE_ENV: 'unittest',
    // MIDWAY_SERVER_ENV: 'unittest',
    FORCE_COLOR: 3,
  }
})

let callback = () => { }
child.on('message', data => {
  if (data.action === 'collect_mem_result') {
    return callback(data.data)
  }
})

async function collectMem() {
  return new Promise((resolve, reject) => {
    callback = resolve
    child.send({ action: 'collect_mem' })
  })
}


echo`Current pid is ${child.pid}`
const firstMem = await collectMem()
echo`  - first memory  (init  test), rss=${format(firstMem.rss)}, heapUsed=${format(
    firstMem.heapUsed
  )}`

child.on('error', err => {
  console.error(err)
})

child.on('exit', (code, signal) => {
  console.log(`Exited with code ${code} and signal ${signal}`)
})

echo`Initialization...`
await sleep(10000)

echo`Running benchmark...`
const results = await cannon()
echo`QPS:  ${results.requests.average}`

const reqestAvg = 3000
// retry qps.
if (results.requests.average < reqestAvg) {
  console.log(`Benchmark failed, QPS is too low then ${reqestAvg} `)
  exitWithError()
}

await sleep(15000)

// 采集一次内存
const secondMem = await collectMem();
echo`  - second memory (before gc1), rss=${format(secondMem.rss)}, heapUsed=${format(
    secondMem.heapUsed
  )}`

child.send({ action: 'gc' })
await sleep(15000)

// gc 后采集一次内存
const thirdMem = await collectMem();
echo`  - third memory  (after  gc1), rss=${format(thirdMem.rss)}, heapUsed =${format(
    thirdMem.heapUsed
  )}`

// 第一次检查，gc 后和初始化持平
const ratio1 = +Math.abs(thirdMem.heapUsed / firstMem.heapUsed).toFixed(2)
echo`ratio1: ${ratio1}`
if (ratio1 > 1.1) {
  console.error('check1: memory leak warning')
  exitWithError()
}

// 继续压测
echo`Running benchmark 2...`
const secondResult = await cannon()
echo`QPS:  ${secondResult.requests.average}`

if (results.requests.average < reqestAvg) {
  console.log(`Benchmark failed, QPS is too low then ${reqestAvg} `)
  exitWithError()
}

await sleep(15000)

const fourthMem = await collectMem()
echo`  - fourth memory (before gc2), rss=${format(
    fourthMem.rss
  )}, heapUsed=${format(fourthMem.heapUsed)}`

child.send({ action: 'gc' })
await sleep(15000)

// gc 后采集一次内存
const fifthMem = await collectMem()
echo`  - fifth  memory (after  gc2), rss=${format(fifthMem.rss)}, heapUsed =${format(
    fifthMem.heapUsed
  )}`

// 第二次检查，第二次 gc 中的堆内存和第一次 gc 持平，gc 前的数值不定，容错率大一些
const ratio2 = +Math.abs(fourthMem.heapUsed / secondMem.heapUsed).toFixed(2)
echo`ratio2: ${ratio2}`
if (ratio2 > 1.5) {
  console.error('check2: memory leak warning')
  exitWithError()
}

// 第三次检查，第三次 gc 之后和第一次 gc 结果持平
const ratio3 = +Math.abs(fifthMem.heapUsed / thirdMem.heapUsed).toFixed(2)
echo`ratio3: ${ratio3}`
if (ratio3 > 1.2) {
  console.error('check3: memory leak warning')
  exitWithError()
}

echo` \n`
await $`autocannon -c 100 -p 2 -d 60 http://127.0.0.1:7001/${api}`
echo` \n`


child.kill()
process.exit(0)


/* ---- END ---- */

function exitWithError() {
  child.kill()
  process.exit(1)
}

