import { join } from 'path';
import * as request from 'request';
import { sleep } from '../../src/util';
import { ThreadManager } from '../../src/manager/thread';
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

describe.skip('/test/fork/thread.test.ts', () => {
  it('should test thread fork and close', async () => {
    const clusterFork = new ThreadManager({
      exec: join(__dirname, 'case-thread/worker-1.ts'),
      count: 2,
      limit: 2
    });

    await clusterFork.start();
    await sleep(2000);
    await clusterFork.stop();

    expect(Object.keys(cluster.workers).length).toEqual(0);
  });

  it('should test thread fork and auto re-fork', async () => {
    const clusterFork = new ThreadManager({
      exec: join(__dirname, 'case-thread/worker-2.ts'),
      count: 1,
    });

    await clusterFork.start();

    await sleep(500);

    try {
      await fetch('http://127.0.0.1:8000/error');
    } catch (err) {}

    await sleep(500);

    expect(await fetch('http://127.0.0.1:8000')).toEqual('hello world');

    // expect(Object.keys(cluster.workers).length).toEqual(1);

    await new Promise<void>((resolve) => {
      setTimeout(async () => {
        console.log('end');
        await clusterFork.stop();
        resolve();
      }, 2000);
    });
  });

  it('should test thread fork and re-fork to limit', async () => {
    const clusterFork = new ThreadManager({
      exec: join(__dirname, 'case-thread/worker-3.ts'),
      count: 1,
      limit: 2
    });

    await clusterFork.start();

    await sleep(500);

    try {
      await fetch('http://127.0.0.1:8000/error');
    } catch (err) {}

    await sleep(500);

    try {
      await fetch('http://127.0.0.1:8000/error');
    } catch (err) {}

    await sleep(500);

    let error;
    try {
      await fetch('http://127.0.0.1:8000');
    } catch (err) {
      error = err;
    }

    expect(error).toBeDefined();

    await sleep(2000);

    await clusterFork.stop();
  });
});
