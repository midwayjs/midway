import { MidwayFrameworkLogger } from '../../src';
import { join } from 'path';
import * as cluster from 'cluster';

if (cluster.isMaster) {
  console.log(`Master ${process.pid} is running`);
  const pidList = [];

  // Fork workers.
  for (let i = 0; i < 4; i++) {
    const cp = cluster.fork();
    pidList.push(cp.process.pid);
  }
  process.send(pidList);

  cluster.on('exit', (worker, code, signal) => {
    console.log(`worker ${worker.process.pid} died`);
  });
} else {
  const logger = new MidwayFrameworkLogger({
    dir: join(__dirname, 'logs'),
  });
  setInterval( () => {
    logger.error(process.pid  + ': output application error');
  },  100);

}
