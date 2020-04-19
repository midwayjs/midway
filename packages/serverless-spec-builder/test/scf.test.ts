import * as assert from 'assert';
import * as fs from 'fs';
import * as path from 'path';
import { generateFunctionsSpec, generateFunctionsSpecFile } from '../src/scf';
import { SCFServerlessStructure } from '../src/scf/interface';

describe('/test/scf.test.ts', () => {
  describe('generate', () => {
    const root = path.resolve(__dirname, 'fixtures/scf');

    it('test transform yml', () => {
      const result: SCFServerlessStructure = generateFunctionsSpec(
        path.join(root, 'serverless.yml')
      );
      assert(result.functions);
      assert(Array.isArray(result.plugins));
    });

    it('test generate spce file', () => {
      generateFunctionsSpecFile(path.join(root, 'serverless.yml'));
      assert(fs.existsSync(path.join(root, '.serverless/serverless.yml')));
      fs.unlinkSync(path.join(root, '.serverless/serverless.yml'));
      fs.rmdirSync(path.join(root, '.serverless'));
    });
  });

  describe('validate transform', () => {
    it('test base', () => {
      const result = generateFunctionsSpec(
        path.join(__dirname, './fixtures/scf/f-base.yml')
      );
      assert.deepStrictEqual(result, {
        service: 'serverless-hello-world',
        provider: {
          name: 'tencent',
          runtime: 'Nodejs8.9',
          region: 'ap-shanghai',
          credentials: '~/credentials',
          stage: 'dev',
          role: 'QCS_SCFExcuteRole',
          memorySize: 256,
          environment: { variables: { ENV_FIRST: 'env1', ENV_SECOND: 'env2' } },
          timeout: 10,
        },
        functions: {
          index: {
            handler: 'index.handler',
            runtime: 'Nodejs8.9',
            timeout: 10,
            memorySize: 256,
          },
        },
      });
    });

    it('test transform http event', () => {
      const result = generateFunctionsSpec(
        path.join(__dirname, './fixtures/scf/f-event-apigw.yml')
      );

      assert.deepStrictEqual(result, {
        service: 'serverless-hello-world',
        provider: {
          name: 'tencent',
          runtime: 'Node.js10.15',
          memorySize: 128,
          timeout: 3,
        },
        functions: {
          index: {
            handler: 'index.handler',
            runtime: 'Node.js10.15',
            timeout: 3,
            memorySize: 128,
            events: [
              {
                apigw: {
                  name: 'index_apigw_dev',
                  parameters: { httpMethod: 'GET', path: '/foo' },
                },
              },
            ],
          },
        },
      });
    });

    it('test transform timer event', () => {
      const result = generateFunctionsSpec(
        path.join(__dirname, './fixtures/scf/f-event-timer.yml')
      );
      assert.deepStrictEqual(result, {
        service: 'serverless-hello-world',
        provider: {
          name: 'tencent',
          runtime: 'Node.js10.15',
          memorySize: 128,
          timeout: 3,
        },
        functions: {
          index: {
            handler: 'index.handler',
            runtime: 'Node.js10.15',
            timeout: 3,
            memorySize: 128,
            events: [
              {
                timer: {
                  name: 'timer',
                  parameters: { cronExpression: '*/5 * * * *', enable: true },
                },
              },
            ],
          },
        },
      });
    });

    it('test transform cos event', () => {
      const result = generateFunctionsSpec(
        path.join(__dirname, './fixtures/scf/f-event-cos.yml')
      );

      assert.deepStrictEqual(result, {
        service: 'serverless-hello-world',
        provider: {
          name: 'tencent',
          runtime: 'Node.js10.15',
          memorySize: 128,
          timeout: 3,
        },
        functions: {
          index: {
            handler: 'index.handler',
            runtime: 'Node.js10.15',
            timeout: 3,
            memorySize: 128,
            events: [
              {
                cos: {
                  name: 'cos',
                  parameters: {
                    bucket: 'cli-appid.cos.ap-beijing.myqcloud.com',
                    filter: { prefix: 'filterdir/', suffix: '.jpg' },
                    events: 'cos:ObjectCreated:*',
                    enable: false,
                  },
                },
              },
            ],
          },
        },
      });
    });

    it('test transform cmq event', () => {
      const result = generateFunctionsSpec(
        path.join(__dirname, './fixtures/scf/f-event-cmq.yml')
      );

      assert.deepStrictEqual(result, {
        service: 'serverless-hello-world',
        provider: {
          name: 'tencent',
          runtime: 'Node.js10.15',
          memorySize: 128,
          timeout: 3,
        },
        functions: {
          index: {
            handler: 'index.handler',
            runtime: 'Node.js10.15',
            timeout: 3,
            memorySize: 128,
            events: [
              {
                cmq: {
                  name: 'cmq',
                  parameters: { enable: false, name: 'test-topic-queue' },
                },
              },
            ],
          },
        },
      });
    });
  });
});
