# cfork

Many students have not heard of cfork. cfork library is the library used to start the main process in egg-scripts. it is one of the basic libraries used by egg. its function is to start the process and maintain the preservation of multiple processes.


The document is [https:// github.com/node-modules/cfork](https://github.com/node-modules/cfork).


Due to the characteristics of bootstrap.js, it is sometimes not very suitable for pm2 deployment (for example, within the group, the global installation is not installed and API startup is required).


We can add a `server.js` as the portal for the main process and use `bootstrap.js` as the startup portal for each subprocess.


```javascript
// server.js

'use strict';

const cfork = require('cfork');
const util = require('util');
const path = require('path');
const os = require('os');

// Get cpu cores
const cpuNumbers = os.cpus().length;

cfork({
  exec: path.join(__dirname, './bootstrap.js')
  count: cpuNumbers
})
  .on('fork', (worker) => {
    console.warn('[%s] [worker:%d] new worker start', Date(), worker.process.pid);
  })
  .on('disconnect', (worker) => {
    console.warn (
      '[%s] [master:%s] wroker:%s disconnect, exitedAfterDisconnect: %s, state: %s .',
      Date()
      process.pid
      worker.process.pid
      worker.exitedAfterDisconnect
      worker.state
    );
  })
  .on('exit', (worker, code, signal) => {
    const exitCode = worker.process.exitCode;
    const err = new Error (
      util.format (
        'worker %s died (code: %s, signal: %s, exitedAfterDisconnect: %s, state: %s)',
        worker.process.pid
        exitCode
        signal
        worker.exitedAfterDisconnect
        worker.state
      )
    );
    err.name = 'WorkerDiedError';
    console.error('[%s] [master:%s] wroker exit: %s', Date(), process.pid, err.stack);
  });
```

Finally, start `node server.js`.
