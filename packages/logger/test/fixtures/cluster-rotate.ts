import * as cluster from 'cluster';
import { FileStreamRotator } from '../../src/fileStreamRotator';
import { join } from 'path';
import * as crypto from 'crypto';
import { sleep } from '../util';

(async () => {

  if (cluster['isMaster']) {
    console.log(`Master ${process.pid} is running`);
    const pidList = [];

    // Fork workers.
    for (let i = 0; i < 4; i++) {
      const cp = (cluster as any).fork();
      pidList.push(cp.process.pid);
    }
    process.send(pidList);

    (cluster as any).on('exit', (worker, code, signal) => {
      console.log(`worker ${worker.process.pid} died`);
    });
  } else {
    const buffer: Buffer = await new Promise(resolve => {
      crypto.randomBytes(1000, (err, buffer) => {
        resolve(buffer);
      });
    });
    const logFile = join(__dirname, '../logs/test.log');
    const rotator = new FileStreamRotator();
    const logStream = rotator.getStream({
      filename: logFile,
      size: '2k',
      frequency: 'custom',
      end_stream: true,
    });

    for (let i = 0; i < 10; i++) {
      logStream.write(buffer);
      await sleep();
    }
    logStream.end();
    process.exit(0);
  }
})()
