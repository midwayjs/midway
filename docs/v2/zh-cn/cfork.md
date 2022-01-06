---
title: 使用 cfork
---

很多同学没有听过 cfork，cfork 库是 egg-scripts 中用于启动主进程的库，是 egg 使用的基础库之一，他的功能是启动进程，并维持多个进程的保活。
​

文档在此：[https://github.com/node-modules/cfork](https://github.com/node-modules/cfork)
​

由于 bootstrap.js 的特性，有时候不是很适合 pm2 来部署（比如集团内部，全局不安装，需要 API 启动）。
​

我们可以新增一个 `server.js` 用来做主进程的入口，将 `bootstrap.js` 作为每个子进程的启动入口。
​

```javascript
// server.js

'use strict';

const cfork = require('cfork');
const util = require('util');
const path = require('path');
const os = require('os');

// 获取 cpu 核数
const cpuNumbers = os.cpus().length;

cfork({
  exec: path.join(__dirname, './bootstrap.js'),
  count: cpuNumbers,
})
  .on('fork', (worker) => {
    console.warn('[%s] [worker:%d] new worker start', Date(), worker.process.pid);
  })
  .on('disconnect', (worker) => {
    console.warn(
      '[%s] [master:%s] wroker:%s disconnect, exitedAfterDisconnect: %s, state: %s.',
      Date(),
      process.pid,
      worker.process.pid,
      worker.exitedAfterDisconnect,
      worker.state
    );
  })
  .on('exit', (worker, code, signal) => {
    const exitCode = worker.process.exitCode;
    const err = new Error(
      util.format(
        'worker %s died (code: %s, signal: %s, exitedAfterDisconnect: %s, state: %s)',
        worker.process.pid,
        exitCode,
        signal,
        worker.exitedAfterDisconnect,
        worker.state
      )
    );
    err.name = 'WorkerDiedError';
    console.error('[%s] [master:%s] wroker exit: %s', Date(), process.pid, err.stack);
  });
```

最后启动 `node server.js` 即可。
