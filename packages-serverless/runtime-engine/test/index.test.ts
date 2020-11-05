import path = require('path');
import { BaseRuntimeEngine, Runtime, ServerlessBaseRuntime } from '../src';
import { exec } from 'child_process';
import * as assert from 'assert';
import { testExtension } from './fixtures/base';
import { HttpEvent } from './fixtures/extension/httpEvent';

describe('/test/index.test.ts', () => {
  describe('basic', () => {
    before(() => {
      // 设置函数执行目录
      process.env.ENTRY_DIR = path.join(__dirname, './fixtures/common');
    });

    it('start a mock runtime with a server', async () => {
      const runtimeEngine = new BaseRuntimeEngine();
      runtimeEngine.add(engine => {
        engine.addRuntimeExtension(testExtension);
      });

      await runtimeEngine.ready();

      const result = await new Promise((resolve, reject) => {
        exec('curl 127.0.0.1:3000', (error, stdout, stderr) => {
          if (error) {
            reject(error);
            return;
          }
          resolve(stdout);
        });
      });

      assert(result === 'Hello, world!');
      await runtimeEngine.close();
    });

    it('start a runtime and create a trigger', async () => {
      const runtimeEngine = new BaseRuntimeEngine();
      runtimeEngine.add(engine => {
        engine.addRuntimeExtension(testExtension);
      });

      await runtimeEngine.ready();

      const result = await new Promise((resolve, reject) => {
        exec('curl 127.0.0.1:3000', (error, stdout, stderr) => {
          if (error) {
            reject(error);
            return;
          }
          resolve(stdout);
        });
      });

      assert(result === 'Hello, world!');
      await runtimeEngine.close();
    });

    it.skip('start with timeout', async () => {
      let flag = false;
      const bak = process.kill;
      process.kill = () => {
        flag = true;
      };
      const runtimeEngine = new BaseRuntimeEngine();
      runtimeEngine.add(engine => {
        engine.addRuntimeExtension({
          async beforeRuntimeStart(runtime: Runtime) {
            return new Promise(resolve => setImmediate(() => resolve()));
          },
        });
      });
      runtimeEngine.ready();
      (runtimeEngine.getCurrentRuntime() as ServerlessBaseRuntime).emit(
        'startTimeout'
      );
      assert(flag);
      await runtimeEngine.close();
      process.kill = bak;
    });

    it.skip('start with error', async () => {
      let flag = false;
      const bak = process.kill;
      process.kill = () => {
        flag = true;
      };
      const runtimeEngine = new BaseRuntimeEngine();
      runtimeEngine.add(engine => {
        engine.addRuntimeExtension({
          async beforeRuntimeStart(runtime: Runtime) {
            return new Promise(resolve => setImmediate(() => resolve()));
          },
        });
      });
      runtimeEngine.ready();
      (runtimeEngine.getCurrentRuntime() as ServerlessBaseRuntime).emit(
        'error',
        new Error()
      );
      assert(flag);
      await runtimeEngine.close();
      process.kill = bak;
    });
  });

  describe('common', () => {
    it('should get propertyParser', () => {
      const dir = path.join(__dirname, './fixtures/extension');
      const entryDir = path.join(__dirname, './fixtures/not-exists');
      process.env.test = dir;
      process.env.ENTRY_DIR = entryDir;
      const runtimeEngine = new BaseRuntimeEngine();
      runtimeEngine.ready();
      const runtime = runtimeEngine.getCurrentRuntime();
      runtime.getPropertyParser();
      const res = runtime.getProperty('test');
      assert.equal(res, dir);
      const res2 = runtime.getPropertyParser().getEntryDir();
      assert.equal(res2, entryDir);
    });

    it('should create logger', () => {
      const runtimeEngine = new BaseRuntimeEngine();
      runtimeEngine.ready();
      const runtime = runtimeEngine.getCurrentRuntime();
      const logger = runtime.createLogger();
      assert.equal(logger, console);
    });

    it('should try transformInvokeArgs', () => {
      const runtimeEngine = new BaseRuntimeEngine();
      const fn = async (ctx, runtime) => {};
      runtimeEngine.addContextExtension(fn);
      runtimeEngine.ready();
      const runtime = runtimeEngine.getCurrentRuntime();
      const res = runtime.getContextExtensions();
      assert(fn === res[0]);
    });
  });

  describe('extension', () => {
    it('should test with extension', async () => {
      process.env.ENTRY_DIR = path.join(__dirname, './fixtures/extension');
      const runtimeEngine = new BaseRuntimeEngine();
      const httpEvent = new HttpEvent({ logger: console.log });
      runtimeEngine.add(engine => {
        const http = require('http');
        let server;
        engine.addRuntimeExtension({
          async beforeClose() {
            return new Promise(resolve => server.close(() => resolve()));
          },
          async beforeRuntimeStart(runtime: Runtime) {
            return new Promise(resolve => {
              server = http
                .createServer(async (request, response) => {
                  response.writeHead(200, { 'Content-Type': 'text/plain' });
                  const res = await runtime.invoke();
                  response.end(res);
                })
                .listen(3000, '127.0.0.1', () => {
                  runtime.debugLogger.log('server started');
                  resolve();
                });
            });
          },
          async beforeInvoke(ctx: any, args) {
            ctx.myValue = ctx.myValue + ': ';
          },
        });
        engine.addEventExtension(async () => httpEvent);
        engine.addHealthExtension(async (ctx, runtime) => {
          console.log('--- health ctx', ctx, 'runtime', runtime);
        });
        engine.addContextExtension(async ctx => {
          ctx.myValue = 'res';
        });
      });

      await runtimeEngine.ready();

      const result = await new Promise((resolve, reject) => {
        exec('curl 127.0.0.1:3000', (error, stdout, stderr) => {
          if (error) {
            reject(error);
            return;
          }
          resolve(stdout);
        });
      });

      assert(result === 'res: Hello, world!');
      await runtimeEngine.close();
    });

    it('should test extension without args format', async () => {
      process.env.ENTRY_DIR = path.join(__dirname, './fixtures/extension');
      const runtimeEngine = new BaseRuntimeEngine();
      const httpEvent = new HttpEvent({ logger: console.log });
      httpEvent.transformInvokeArgs = () => null;
      runtimeEngine.add(engine => {
        const http = require('http');
        let server;
        engine.addRuntimeExtension({
          async beforeClose() {
            return new Promise(resolve => server.close(() => resolve()));
          },
          async beforeRuntimeStart(runtime: Runtime) {
            return new Promise(resolve => {
              server = http
                .createServer(async (request, response) => {
                  response.writeHead(200, { 'Content-Type': 'text/plain' });
                  const res = await runtime.invoke();
                  response.end(res);
                })
                .listen(3000, '127.0.0.1', () => {
                  runtime.debugLogger.log('server started');
                  resolve();
                });
            });
          },
          async beforeInvoke(ctx: any, args) {
            ctx.myValue = ctx.myValue + ': ';
          },
        });
        engine.addEventExtension(async () => httpEvent);
        engine.addHealthExtension(async (ctx, runtime) => {
          console.log('--- health ctx', ctx, 'runtime', runtime);
        });
        engine.addContextExtension(async (ctx, runtime) => {
          ctx.myValue = 'res';
        });
      });

      await runtimeEngine.ready();

      const result = await new Promise((resolve, reject) => {
        exec('curl 127.0.0.1:3000', (error, stdout, stderr) => {
          if (error) {
            reject(error);
            return;
          }
          resolve(stdout);
        });
      });

      assert(result === 'res: Hello, world!');
      await runtimeEngine.close();
    });
  });

  describe('invoke', () => {
    it('should invoke defaultInvokeHandler handler with error', async () => {
      process.env.ENTRY_DIR = path.join(__dirname, './fixtures/no-exists');
      const runtimeEngine = new BaseRuntimeEngine();
      const httpEvent = new HttpEvent({ logger: console.log });
      runtimeEngine.add(engine => {
        const http = require('http');
        let server;
        engine.addRuntimeExtension({
          async beforeClose() {
            return new Promise(resolve => server.close(() => resolve()));
          },
          async beforeRuntimeStart(runtime: Runtime) {
            return new Promise(resolve => {
              server = http
                .createServer(async (request, response) => {
                  response.writeHead(200, { 'Content-Type': 'text/plain' });
                  const res = await runtime.invoke().catch(err => err);
                  response.end(res.message);
                })
                .listen(3000, '127.0.0.1', () => resolve());
            });
          },
        });
        engine.addEventExtension(async () => httpEvent);
      });

      await runtimeEngine.ready();

      const result: string = await new Promise((resolve, reject) => {
        exec('curl 127.0.0.1:3000', (error, stdout, stderr) => {
          if (error) {
            reject(error);
            return;
          }
          resolve(stdout);
        });
      });

      assert(result.includes('handler not found:'));
      await runtimeEngine.close();
    });

    it('should invoke error', async () => {
      process.env.ENTRY_DIR = path.join(__dirname, './fixtures/error');
      const runtimeEngine = new BaseRuntimeEngine();
      let errorLogged = false;
      const httpEvent = new HttpEvent({ logger: console.log });
      runtimeEngine.add(engine => {
        const http = require('http');
        let server;
        engine.addRuntimeExtension({
          async beforeClose() {
            return new Promise(resolve => server.close(() => resolve()));
          },
          async beforeRuntimeStart(runtime: Runtime) {
            return new Promise(resolve => {
              server = http
                .createServer(async (request, response) => {
                  response.writeHead(200, { 'Content-Type': 'text/plain' });
                  const res = await runtime.invoke().catch(err => err);
                  response.end(res.message);
                })
                .listen(3000, '127.0.0.1', () => resolve());
            });
          },
        });
        engine.addEventExtension(async () => httpEvent);
        engine.addContextExtension(async ctx => {
          ctx.logger = {
            error: () => {
              errorLogged = true;
            },
          };
        });
      });

      await runtimeEngine.ready();

      const result: string = await new Promise((resolve, reject) => {
        exec('curl 127.0.0.1:3000', (error, stdout, stderr) => {
          if (error) {
            reject(error);
            return;
          }
          resolve(stdout);
        });
      });

      assert(result.includes('Ops'));
      assert(errorLogged);
      await runtimeEngine.close();
    });

    it('should load function crash', async () => {
      process.env.ENTRY_DIR = path.join(__dirname, './fixtures/crash');
      const runtimeEngine = new BaseRuntimeEngine();
      const httpEvent = new HttpEvent({ logger: console.log });
      runtimeEngine.add(engine => {
        const http = require('http');
        let server;
        engine.addRuntimeExtension({
          async beforeClose() {
            return new Promise(resolve => server.close(() => resolve()));
          },
          async beforeRuntimeStart(runtime: Runtime) {
            return new Promise(resolve => {
              server = http
                .createServer(async (request, response) => {
                  response.writeHead(200, { 'Content-Type': 'text/plain' });
                  const res = await runtime.invoke().catch(err => err);
                  response.end(res.message);
                })
                .listen(3000, '127.0.0.1', () => resolve());
            });
          },
        });
        engine.addEventExtension(async () => httpEvent);
      });

      try {
        await runtimeEngine.ready();
      } catch (err) {
        assert.equal(err.message, 'function init error with: empty');
      }

      await runtimeEngine.close();
    });
  });
});
