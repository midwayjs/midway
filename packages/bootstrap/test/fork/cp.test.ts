import { ClusterManager } from '../../src';
import { join } from 'path';
import * as request from 'request';
import { sleep } from '../../src/util';
const cluster = require('cluster');

function fetch(url) {
  return new Promise((resolve, reject) => {
    request.get(url, (err, res, body) => {
      if (err) {
        reject(err);
      } else {
        resolve(body);
      }
    });
  })
}

describe('/test/fork/cp.test.ts', () => {
  it('should test cluster fork and close', async () => {
    const clusterFork = new ClusterManager({
      exec: join(__dirname, 'case-cp/worker-1.ts'),
      count: 2,
    });

    await clusterFork.start();
    await sleep(2000);
    await clusterFork.stop();

    expect(Object.keys(cluster.workers).length).toEqual(0);
  });

  it('should test cluster fork and auto re-fork', async () => {
    const clusterFork = new ClusterManager({
      exec: join(__dirname, 'case-cp/worker-2.ts'),
      count: 1,
    });

    await clusterFork.start();

    await sleep(500);

    expect(clusterFork.getWorkerIds().length).toEqual(1);
    const currentPid = clusterFork.getWorkerIds()[0];
    console.log('currentPid=', currentPid);

    try {
      await fetch('http://127.0.0.1:8000/error');
    } catch (err) {}

    await new Promise<void>((resolve) => {
      clusterFork['eventBus'].subscribeOnce(message => {
        resolve();
      }, {
        topic: 'ready'
      })
    });

    expect(await fetch('http://127.0.0.1:8000')).toEqual('hello world');

    expect(clusterFork.getWorkerIds().length).toEqual(1);

    await new Promise<void>((resolve) => {
      setTimeout(async () => {
        console.log('end');
        await clusterFork.stop();
        resolve();
      }, 2000);
    });
  });

  it('should test cluster fork and re-fork to limit', async () => {
    const clusterFork = new ClusterManager({
      exec: join(__dirname, 'case-cp/worker-3.ts'),
      count: 1,
      limit: 2
    });

    await clusterFork.start();

    await sleep(500);

    try {
      console.log('----curl 1');
      await fetch('http://127.0.0.1:8000/error');
    } catch (err) {}

    await new Promise<void>((resolve) => {
      clusterFork['eventBus'].subscribeOnce(message => {
        resolve();
      }, {
        topic: 'ready'
      })
    });

    try {
      console.log('----curl 2');
      await fetch('http://127.0.0.1:8000/error');
    } catch (err) {}

    await sleep(1000);

    let error;
    try {
      console.log('----curl 3');
      await fetch('http://127.0.0.1:8000');
    } catch (err) {
      error = err;
    }

    expect(error.name).toBeDefined();

    await sleep(2000);

    await clusterFork.stop();
  });
});
