import { close, createLightApp } from '@midwayjs/mock';
import * as koa from '@midwayjs/koa';
import * as express from '@midwayjs/koa';
import { Controller, Get, sleep } from '@midwayjs/core';
import * as sse from '../src';
import { ServerSendEventStream } from '../src';
import * as EventSource from 'eventsource';

describe('/test/index.test.ts', () => {
  describe('test sse in koa', () => {
    it('should test push server send event', async () => {
      @Controller()
      class APIController {
        @Get('/sse')
        async sse(ctx) {
          const stream =  new ServerSendEventStream(ctx);
          Promise.resolve().then(async () => {
            stream.send({
              data: 'abc',
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
            stream.sendEnd('你好');
          });
          return stream;
        }
      }

      const port = 7001;

      const app = await createLightApp({
        imports: [
          koa,
          sse,
        ],
        globalConfig: {
          keys: '123',
          koa: {
            port,
          }
        },
        preloadModules: [
          APIController
        ]
      });

      let result = [];
      await new Promise<void>(resolve => {
        const eventSource = new EventSource('http://localhost:' + port + '/sse');
        eventSource.onopen = function(event) {
          console.log('SSE open');
        };

        eventSource.onmessage = ({ data }) => {
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

      await close(app);
    });

    it('should send base format', async () => {
      @Controller()
      class APIController {
        @Get('/sse')
        async sse(ctx) {
          const stream =  new ServerSendEventStream(ctx);
          Promise.resolve().then(async () => {
            stream.send({
              data: 'bcd',
              retry: 1000,
              event: 'test',
              id: '123'
            });
            stream.sendEnd('你好');
          });
          return stream;
        }
      }

      const port = 7001;

      const app = await createLightApp({
        imports: [
          koa,
          sse,
        ],
        globalConfig: {
          keys: '123',
          koa: {
            port,
          }
        },
        preloadModules: [
          APIController
        ]
      });

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

      await close(app);
    });

    it('should close when client emit stream close', async () => {
      let handler = null;
      @Controller()
      class APIController {
        @Get('/sse')
        async sse(ctx) {
          const stream =  new ServerSendEventStream(ctx);
          handler = setInterval(() => {
            stream.send({
              data: 'abc',
            });
          }, 300);
          return stream;
        }
      }

      const port = 7001;

      const app = await createLightApp({
        imports: [
          koa,
          sse,
        ],
        globalConfig: {
          keys: '123',
          koa: {
            port,
          }
        },
        preloadModules: [
          APIController
        ]
      });

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
      await close(app);
    });

    it('should server response throw error', async () => {
      let handler = null;
      @Controller()
      class APIController {
        @Get('/sse')
        async sse(ctx) {
          const stream =  new ServerSendEventStream(ctx);
          handler = setInterval(() => {
            stream.send({
              data: 'abc',
            });

            stream.sendError(new Error('test error'));
            stream.destroy();
          }, 300);

          return stream;
        }
      }

      const port = 7001;

      const app = await createLightApp({
        imports: [
          koa,
          sse,
        ],
        globalConfig: {
          keys: '123',
          koa: {
            port,
          }
        },
        preloadModules: [
          APIController
        ]
      });

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
      await close(app);
    });
  });

  describe('test sse in express', () => {
    it('should test push server send event', async () => {
      @Controller()
      class APIController {
        @Get('/sse')
        async sse(ctx) {
          const stream =  new ServerSendEventStream(ctx);
          Promise.resolve().then(async () => {
            stream.send({
              data: 'abc',
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
            stream.sendEnd('你好');
          });
          return stream;
        }
      }

      const port = 7001;

      const app = await createLightApp({
        imports: [
          koa,
          express,
        ],
        globalConfig: {
          keys: '123',
          koa: {
            port,
          }
        },
        preloadModules: [
          APIController
        ]
      });

      let result = [];
      await new Promise<void>(resolve => {
        const eventSource = new EventSource('http://localhost:' + port + '/sse');
        eventSource.onopen = function(event) {
          console.log('SSE open');
        };

        eventSource.onmessage = ({ data }) => {
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

      await close(app);
    });

    it('should send base format', async () => {
      @Controller()
      class APIController {
        @Get('/sse')
        async sse(ctx) {
          const stream =  new ServerSendEventStream(ctx);
          Promise.resolve().then(async () => {
            stream.send({
              data: 'bcd',
              retry: 1000,
              event: 'test',
              id: '123'
            });
            stream.sendEnd('你好');
          });
          return stream;
        }
      }

      const port = 7001;

      const app = await createLightApp({
        imports: [
          express,
          sse,
        ],
        globalConfig: {
          keys: '123',
          koa: {
            port,
          }
        },
        preloadModules: [
          APIController
        ]
      });

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

      await close(app);
    });

    it('should close when client emit stream close', async () => {
      let handler = null;
      @Controller()
      class APIController {
        @Get('/sse')
        async sse(ctx) {
          const stream =  new ServerSendEventStream(ctx);
          handler = setInterval(() => {
            stream.send({
              data: 'abc',
            });
          }, 300);
          return stream;
        }
      }

      const port = 7001;

      const app = await createLightApp({
        imports: [
          express,
          sse,
        ],
        globalConfig: {
          keys: '123',
          koa: {
            port,
          }
        },
        preloadModules: [
          APIController
        ]
      });

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
      await close(app);
    });

    it('should server response throw error', async () => {
      let handler = null;
      @Controller()
      class APIController {
        @Get('/sse')
        async sse(ctx) {
          const stream =  new ServerSendEventStream(ctx);
          handler = setInterval(() => {
            stream.send({
              data: 'abc',
            });

            stream.sendError(new Error('test error'));
            stream.destroy();
          }, 300);

          return stream;
        }
      }

      const port = 7001;

      const app = await createLightApp({
        imports: [
          express,
          sse,
        ],
        globalConfig: {
          keys: '123',
          koa: {
            port,
          }
        },
        preloadModules: [
          APIController
        ]
      });

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
      await close(app);
    });
  });
});
