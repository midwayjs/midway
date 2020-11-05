import { Runtime } from '../../src/interface';
import * as http from 'http';

let server;
export const testExtension = {
  async beforeClose(runtime: Runtime) {
    return new Promise(resolve => {
      server.close(() => {
        runtime.debugLogger.log('server closed');
        resolve();
      });
    });
  },
  async beforeRuntimeStart(runtime: Runtime) {
    return new Promise(resolve => {
      server = http
        .createServer((request, response) => {
          response.writeHead(200, { 'Content-Type': 'text/plain' });
          runtime.invokeDataHandler().then(res => {
            response.end(res);
          });
        })
        .listen(3000, '127.0.0.1', () => {
          runtime.debugLogger.log('server started');
          resolve();
        });
    });
  },
};
