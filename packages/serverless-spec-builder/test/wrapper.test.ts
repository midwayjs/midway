import { writeWrapper } from '../src/wrapper';
import { resolve } from 'path';
import * as assert from 'assert';
import { existsSync, readFileSync } from 'fs';

describe('/test/wrapper.test.ts', () => {
  describe('test all format', () => {
    it('writeWrapper', () => {
      const wrapperPath = resolve(__dirname, './fixtures/wrapper');
      writeWrapper({
        initializeName: 'initializeUserDefine',
        cover: true,
        service: {
          functions: {
            aggregation: {
              handler: 'aggre.handler',
              _isAggregation: true,
              functions: ['index'],
              _handlers: [
                { path: '/api/test', handler: 'index.handler' },
                { path: '/*', handler: 'render.handler' },
              ],
            },
            index: {
              handler: 'index.handler',
            },
            render: {
              handler: 'render.handler',
            },
          },
        },
        baseDir: wrapperPath,
        distDir: wrapperPath,
        starter: 'testStarter',
      });
      const aggrePath = resolve(wrapperPath, 'aggre.js');
      const indexPath = resolve(wrapperPath, 'index.js');
      const renderPath = resolve(wrapperPath, 'render.js');
      assert(existsSync(aggrePath));
      assert(existsSync(indexPath));
      assert(existsSync(renderPath));
      assert(
        /exports\.initializeUserDefine\s*=/.test(
          readFileSync(aggrePath).toString()
        )
      );
      assert(
        /exports\.initializeUserDefine\s*=/.test(
          readFileSync(indexPath).toString()
        )
      );
      assert(
        /exports\.initializeUserDefine\s*=/.test(
          readFileSync(renderPath).toString()
        )
      );
    });
  });
});
