import { fork } from 'child_process';
import { join } from 'path';
import * as http from 'http';
import { sleep } from '@midwayjs/decorator';

describe('/test/bootstrap.test.ts', () => {
  it('should bootstrap multi framework', async () => {
    let child = fork('bootstrap.js', ['--require=ts-node/register'], {
      cwd: join(__dirname, './fixtures/mix-app'),
    });

    child.on('close', (code) => {
      if (code !== 0) {
        console.log(`process exited with code ${code}`);
      }
    });

    await new Promise<void>((resolve, reject) => {
      child.on('message', (ready) => {
        if (ready === 'ready') {
          resolve();
        }
      });
    });

    await sleep(10000);

    await new Promise<void>(resolve => {
      http.get({
        hostname: 'localhost',
        port: 8080,
        path: '/',
      }, (res) => {
        console.log(res);
        resolve();
      });
    })
    child.kill();
  });
});
