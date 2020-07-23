import { writeWrapper } from '../src/wrapper';
import { resolve } from 'path';
import * as assert from 'assert';
import { existsSync, readFileSync, remove, writeFileSync } from 'fs-extra';

describe('/test/wrapper.test.ts', () => {
  describe('test all format', () => {
    it('writeWrapper functionMap', async () => {
      const wrapperPath = resolve(__dirname, './fixtures/wrapper');
      const faasFunctionMap = resolve(wrapperPath, 'faasFunctionsMap.json');
      const registerFunction = resolve(wrapperPath, 'registerFunction.js');
      if (existsSync(registerFunction)) {
        await remove(registerFunction);
      }
      writeFileSync(
        faasFunctionMap,
        JSON.stringify({
          functionList: [
            {
              functionNama: 'index',
              functionHandler: 'index.handler',
              functionFilePath: 'fun.js',
            },
          ],
        })
      );
      writeWrapper({
        initializeName: 'initializeUserDefine',
        middleware: ['test1', 'test2'],
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
      assert(existsSync(registerFunction));
      assert(
        /registerFunctionToIocByConfig/.test(readFileSync(aggrePath).toString())
      );
      assert(
        /require\('registerFunction\.js'\)/.test(
          readFileSync(aggrePath).toString()
        )
      );
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
      await remove(faasFunctionMap);
      await remove(registerFunction);
    });
    it('writeWrapper', async () => {
      const wrapperPath = resolve(__dirname, './fixtures/wrapper');
      const faasFunctionMap = resolve(wrapperPath, 'faasFunctionsMap.json');
      if (existsSync(faasFunctionMap)) {
        await remove(faasFunctionMap);
      }
      const registerFunction = resolve(wrapperPath, 'registerFunction.js');
      if (existsSync(registerFunction)) {
        await remove(registerFunction);
      }
      writeWrapper({
        initializeName: 'initializeUserDefine',
        middleware: ['test1', 'test2'],
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
      assert(!existsSync(registerFunction));
      assert(
        !/registerFunctionToIocByConfig/.test(
          readFileSync(aggrePath).toString()
        )
      );
      assert(
        !/require\('registerFunction\.js'\)/.test(
          readFileSync(aggrePath).toString()
        )
      );
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
