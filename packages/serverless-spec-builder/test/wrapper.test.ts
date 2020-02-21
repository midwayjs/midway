import { writeWrapper } from '../src/wrapper';
import * as path from 'path';
import * as assert from 'assert';

describe('/test/wrapper.test.ts', () => {
  describe('test all format', () => {
    it('writeWrapper', () => {
      writeWrapper({
        cover: true,
        service: {
          functions: {
            aggregation: {
              handler: 'aggre.handler',
              _isAggregation: true,
              functions: [ 'index' ],
              _handlers: [
                { path: '/api/test', handler: 'index.handler' },
                { path: '/*', handler: 'render.handler' },
              ]
            },
            index: {
              handler: 'index.handler'
            },
            render: {
              handler: 'render.handler'
            }
          }
        },
        baseDir: path.join(__dirname, './fixtures/wrapper'),
        distDir: path.join(__dirname, './fixtures/wrapper'),
        starter: 'testStarter',
      });
      assert(true);
    });
  });
});
