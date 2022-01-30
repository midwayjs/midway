import * as Master from 'egg-cluster/lib/master';
import { join } from 'path';

const name = process.argv[2];

const master = new Master({
  baseDir: join(__dirname, 'fixtures', name),
  workers: 1,
  port: 8080,
  framework: join(__dirname, '../'),
  typescript: true,
  require: 'ts-node/register'
})
process.on('message', (data) => {
  if (data?.['action'] === 'app_end') {
    master.close();
    process.exit(0);
  }
});
master.ready(() => {
  process.send({
    action: 'app_ready'
  });
});
