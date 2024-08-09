// import whyIsNodeRunning from 'why-is-node-running'
import * as EventSource from 'eventsource';
import { HttpServerResponse, sleep } from '../../src';
import { createServer, request } from 'http';

describe('response/http.test.ts', () => {
  describe('test sse in base http', () => {
    it('should test push server send event', async () => {
      const port = 7001;
      const server = createServer((req, res) => {
        const stream =  new HttpServerResponse({
          req,
          res,
          logger: console
        } as any).sse();
        Promise.resolve().then(async () => {
          stream.send({
            data: 'abc',
            retry: 0,
          });
          await sleep();
          stream.send({
            data: 'bcd'
          });
          await sleep();
          stream.send({
            data: 'bcd'.repeat(1000)
          });
          stream.send({
            data: {
              a: 1
            },
          });
          stream.sendEnd({
            data: '你好',
          });
        });
        stream.pipe(res);
      }).listen(port);

      let result = [];
      await new Promise<void>(resolve => {
        const eventSource = new EventSource('http://localhost:' + port + '/sse');
        eventSource.onopen = function(event) {
          console.log('SSE open');
        };

        eventSource.onmessage = ({ data }) => {
          console.log(data);
          result.push(data);
        };

        eventSource.onerror = function(e) {
          console.log('error', e);
        }

        eventSource.addEventListener('close', function(e) {
          expect(e.data).toEqual('你好');
          // 只能客户端主动关闭
          eventSource.close();
          resolve();
        });
      })

      expect(result).toEqual(['abc', 'bcd', 'bcd'.repeat(1000), '{"a":1}']);
      server.close();

      // logs out active handles that are keeping node running
      // setImmediate(() => whyIsNodeRunning())
    });

    it('should send base format', async () => {
      const port = 7001;
      const server = createServer((req, res) => {
        const stream = new HttpServerResponse({
          req,
          res,
          logger: console,
        } as any).sse();
        Promise.resolve().then(async () => {
          stream.send({
            data: 'bcd',
            retry: 1000,
            event: 'test',
            id: '123'
          });
          stream.sendEnd({
            data: '你好',
          });
        });
        stream.pipe(res);
      }).listen(port);

      let result = [];
      await new Promise<void>(resolve => {
        const eventSource = new EventSource('http://localhost:' + port + '/sse');
        eventSource.onopen = function(event) {
          console.log('SSE open');
        };

        eventSource.on('test', ({ data }) => {
          result.push(data);
        });

        eventSource.onerror = function(e) {
          console.log('error', e);
        }

        eventSource.addEventListener('close', function(e) {
          expect(e.data).toEqual('你好');
          // 只能客户端主动关闭
          eventSource.close();
          resolve();
        });
      })

      expect(result).toEqual(['bcd']);

      server.close();
    });

    it('should close when client emit stream close', async () => {
      const port = 7001;
      let handler = null;
      const server = createServer((req, res) => {
        const stream = new HttpServerResponse({
          req,
          res,
          logger: console,
        } as any).sse();
        handler = setInterval(() => {
          stream.send({
            data: 'abc',
          });
        }, 300);
        stream.pipe(res);
      }).listen(port);


      let count = 0;
      await new Promise<void>((resolve, reject) => {
        const eventSource = new EventSource('http://localhost:' + port + '/sse');
        eventSource.onopen = function(event) {
          console.log('SSE open');
        };

        eventSource.onmessage = ({ data }) => {
          console.log(data);
          count++;
        };

        eventSource.onerror = function(e) {
          console.log('error', e);
        }

        sleep(1000).then(() => {
          if (count >= 3) {
            eventSource.close();
            resolve();
          } else {
            reject();
          }
        });
      });

      clearInterval(handler);
      server.close();
    });

    it('should server response throw error', async () => {
      let handler = null;
      const port = 7001;
      const server = createServer((req, res) => {
        const stream = new HttpServerResponse({
          req,
          res,
          logger: console,
        } as any).sse();
        handler = setInterval(() => {
          stream.send({
            data: 'abc',
          });

          stream.sendError(new Error('test error'));
          stream.destroy();
        }, 300);
        stream.pipe(res);
      }).listen(port);

      await new Promise<void>((resolve, reject) => {
        const eventSource = new EventSource('http://localhost:' + port + '/sse');
        eventSource.onopen = function(event) {
          console.log('SSE open');
        };

        eventSource.onmessage = ({ data }) => {
          console.log(data);
        };

        eventSource.onerror = function(e) {
          console.log('error', e);
          eventSource.close();
          resolve();
        }
      });

      clearInterval(handler);
      server.close();
    });
  });

  describe('test stream in base http', () => {
    it('should test stream write', async () => {
      const port = 7001;
      const server = createServer((req, res) => {
        const stream = new HttpServerResponse({
          req,
          res,
          logger: console,
        } as any).stream();
        Promise.resolve().then(async () => {
          stream.write('abc');
          await sleep();
          stream.write('bcd');
          await sleep();
          stream.write('bcd'.repeat(1000));
          stream.end();
        }).catch(console.error);
        stream.pipe(res);
      }).listen(port);

      let result = '';
      await new Promise<void>(resolve => {
        const req = request({
          hostname: 'localhost',
          port,
        }, res => {
          res.on('data', (chunk) => {
            result += chunk.toString();
          });

          res.on('end', () => {
            resolve();
          });

          res.on('error', (e) => {
            console.error(e.message);
          });
        });
        req.on('error', (e) => {
          console.error(e.message);
        });
        req.end();
      });
      server.close();
      await sleep(1000);
      expect(result).toEqual('abcbcd' + 'bcd'.repeat(1000));
    });

    it('should server response throw error', async () => {
      const port = 7001;
      const server = createServer((req, res) => {
        const stream = new HttpServerResponse({
          req,
          res,
          logger: console,
        } as any).stream();

        Promise.resolve().then(async () => {
          // use write
          stream.write('<body>');
          await sleep();
          stream.send('hello');
          await sleep();
          stream.sendError(new Error('test error'));
          stream.send('</body>');
        });
        stream.pipe(res);
      }).listen(port);

      let result = '';
      await new Promise<void>((resolve, reject) => {
        const req = request({
          hostname: 'localhost',
          port,
        }, res => {
          res.on('data', (chunk) => {
            result += chunk.toString();
          });

          res.on('end', () => {
            resolve();
          });

          res.on('error', (e) => {
            console.error(e.message);
          });
        });
        req.on('error', (e) => {
          console.error(e.message);
        });
        req.end();
      });
      server.close();
      await sleep(1000);
      expect(result).toEqual('<body>hello');
    });
  });
});
