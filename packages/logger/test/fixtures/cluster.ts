import { MidwayBaseLogger } from '../../src';
import { join } from 'path';
import * as cluster from 'cluster';

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
  const logger = new MidwayBaseLogger({
    dir: join(__dirname, 'logs'),
  });
  setTimeout( () => {
    logger.error(process.pid  + ': output application error');
    logger.error(process.pid  + ': output application error');
    logger.error(process.pid  + ': output application error');
    logger.error(process.pid  + ': output application error');
    logger.end();
  },  1000);

  logger.on('finish', () => {
    process.exit(0);
  });
}
