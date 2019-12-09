import { BaseRuntimeEngine, Runtime, ServerlessBaseRuntime } from '@midwayjs/runtime-engine';
import * as http from 'http';
import { exec } from 'child_process';

export function sleep(sec = 1000) {
  return new Promise(done => setTimeout(done, sec));
}

export class MockRuntime {
  engine;
  options;
  runtime: ServerlessBaseRuntime;
  layers;
  httpServer;

  constructor(
    options: {
      layers?: any[];
      functionDir?: string;
      runtime?: Runtime
    } = {}
  ) {
    this.options = options;
    this.runtime = this.options.runtime || new ServerlessBaseRuntime();
  }

  async start() {
    process.env.ENTRY_DIR = this.options.functionDir;
    return new Promise(async (resolve, reject) => {
      if (this.runtime.on) {
        this.runtime.on('error', err => {
          reject(err);
        });
      }

      try {
        await this.startRuntime();
        await sleep(1000);
        resolve(this.runtime);
      } catch (err) {
        reject(err);
      }
    });
  }

  async startRuntime() {
    this.engine = new BaseRuntimeEngine();
    this.engine.addBaseRuntime(this.runtime);
    if (this.options.layers && this.options.layers.length) {
      this.options.layers.map(mod => this.engine.add(mod));
    }
    await this.engine.ready();
  }

  async invoke(...args) {
    return this.runtime.invokeDataHandler.apply(this.runtime, args);
  }

  async invokeHTTP(data) {
    return new Promise((resolve, reject) => {
      if (!this.httpServer) {
        this.httpServer = http.createServer((req, res) => {
          const context = {
            req,
            res,
          };
          this.runtime.invokeDataHandler(context);
        });
      }

      this.httpServer.listen(0, (err) => {
        if (err) {
          reject(err);
        } else {
          exec(`curl 127.0.0.1:${this.httpServer.address().port}`, (error, stdout, stderr) => {
            if (error) {
              reject(error);
              return;
            }
            resolve(stdout);
          });
        }
      });
    });
  }

  async close() {
    process.env.ENTRY_DIR = '';
    if (this.httpServer) {
      await this.httpServer.close();
    }
    if (this.engine) {
      await this.engine.close();
    }
    await sleep(1000);
  }
}

export const createRuntime = options => {
  return new MockRuntime(options);
};
