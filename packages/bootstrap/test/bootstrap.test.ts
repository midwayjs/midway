import { fork } from 'child_process';
import { join } from 'path';
import { sleep } from '@midwayjs/core';
import * as request from 'request';
import { io as socketClient } from 'socket.io-client';

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

  it('should bootstrap with cluster', async () => {
    let child = fork('bootstrap.js', ['--require=ts-node/register'], {
      cwd: join(__dirname, './fixtures/cluster-app'),
      stdio: 'inherit',
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

    console.log('---start test http');

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

    // test http upload
    console.log('---start test http upload');
    const httpUploadResult: any = await new Promise<string>(resolve => {
      let req = request.post(`http://localhost:8080/upload`, (error, response, body) => {
        resolve(JSON.parse(body));
      });
      const form = req.form();
      form.append('file', '<FILE_DATA>', {
        filename: 'test.txt',
        contentType: 'text/plain'
      });
    });
    expect(httpUploadResult.files[0].filename === "test.txt");

    console.log('---start test socket.io');

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
