import { fork } from 'child_process';
import { join } from 'path';
import { sleep } from '@midwayjs/decorator';
import * as request from 'request';
import * as socketClient from 'socket.io-client';

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

    await sleep(1000);

    // test http
    const httpResult = await new Promise<string>(resolve => {
      request({
        uri: `http://localhost:8080/`,
        method: 'get',
      }, (error, response, body) => {
        resolve(body);
      });
    });
    expect(httpResult).toEqual('hello world');

    // test socket.io
    let url = 'http://127.0.0.1:8080';
    const client = socketClient(url, {});
    const socketData = await new Promise<{name: string}>(resolve =>  {
      client.on('returnValue', (data) => {
        resolve(data);
      })
      client.emit('my');
    });
    await client.close();
    expect(socketData.name).toEqual('harry');

    child.kill();
  });
});
