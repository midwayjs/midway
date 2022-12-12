import { join } from 'path';
import { startCluster } from '../src';
import * as fs from 'fs';

const name = process.argv[2];

const pkgDir = join(__dirname, '../src/package.json');
fs.writeFileSync(pkgDir, '{}');

const dir = join(__dirname, 'fixtures', name);
process.chdir(dir);

startCluster({
  baseDir: dir,
  workers: 1,
  port: 8080,
  framework: join(__dirname, '../src'),
  typescript: true,
  require: 'ts-node/register'
}, () => {
  if (fs.existsSync(pkgDir)) {
    fs.unlinkSync(pkgDir);
  }
  process.send({
    action: 'app_ready'
  });
});

process.on('message', (data) => {
  if (fs.existsSync(pkgDir)) {
    fs.unlinkSync(pkgDir);
  }
  if (data?.['action'] === 'app_end') {
    // master.close();
    process.exit(0);
  }
});
