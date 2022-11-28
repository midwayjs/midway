import { ClusterFork } from '../../src/fork/base';
import { join } from 'path';

describe('/test/fork/cp.test.ts', () => {
  it('should test cluster fork', async () => {
    const clusterFork = new ClusterFork({
      exec: join(__dirname, 'worker.js'),
      count: 2,
    });

    await clusterFork.start();

    await new Promise<void>((resolve) => {
      setTimeout(async () => {
        console.log('end');
        await clusterFork.close();
        resolve();
      }, 5000);
    })
  });
});
