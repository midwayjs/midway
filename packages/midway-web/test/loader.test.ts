import { clearAllModule, MidwayWebLoader } from '../src';
import { A, B, DbAPI } from './fixtures/complex_injection/dbAPI';
import { UserController } from './fixtures/complex_injection/userController';
import { UserService } from './fixtures/complex_injection/userService';
import * as assert from 'assert';
import { join } from 'path';
import { LOGGER_KEY, saveModule, CONTROLLER_KEY, saveClassMetadata } from '@midwayjs/decorator';
import mm = require('mm');
const Graph = require('graphviz/lib/deps/graph').Graph;

describe('/test/loader.test.ts', () => {
  beforeEach(() => {
    clearAllModule();
  });

  describe('dependency tree', () => {

    it('should generate dependency dot in requestContainer', async () => {
      const loader = new MidwayWebLoader({
        logger: console,
        baseDir: join(__dirname, './fixtures/enhance/base-app'),
        app: {
          options: {
            baseDir: join(__dirname, './fixtures/enhance/base-app'),
          }
        }
      });
      loader.config = {container: {}};
      loader.loadApplicationContext();
      const applicationContext = loader.applicationContext;

      applicationContext.bind(UserService);
      applicationContext.bind(UserController);
      applicationContext.bind(DbAPI);
      const newTree = loader.dumpDependency();
      assert.ok(/userController/.test(newTree));
      assert.ok(/newKey\(DbAPI\)/.test(newTree));
    });

    it('should skip empty properties', async () => {
      const loader = new MidwayWebLoader({
        logger: console,
        baseDir: join(__dirname, './fixtures/enhance/base-app'),
        app: {
          options: {
            baseDir: join(__dirname, './fixtures/enhance/base-app'),
          }
        }
      });
      loader.config = {container: {}};
      loader.loadApplicationContext();
      const applicationContext = loader.applicationContext;
      applicationContext.bind(UserService);
      applicationContext.bind(UserController);
      applicationContext.bind(DbAPI);
      applicationContext.bind(A);
      applicationContext.bind(B);
      const newTree = loader.dumpDependency();
      assert.ok(/userController/.test(newTree));
      assert.ok(/newKey\(DbAPI\)/.test(newTree));
      assert.ok(/"newKey" -> "b"/.test(newTree));
    });

    it('should resolver be ok', async () => {
      const loader = new MidwayWebLoader({
        logger: console,
        baseDir: join(__dirname, './fixtures/enhance/base-app'),
        app: {
          options: {
            baseDir: join(__dirname, './fixtures/enhance/base-app'),
          }
        }
      });
      loader.config = {container: {}};
      loader.loadApplicationContext();
      const log = loader.applicationContext.resolverHandler.getHandler(LOGGER_KEY)('test');
      assert.ok((log as any) === console);

      mm(Graph.prototype, 'to_dot', () => {
        throw new Error('hello to_dot error');
      });
      let msg;
      mm(console, 'error', (m1, m2) => {
        msg = m1 + m2;
      });
      loader.dumpDependency();
      mm.restore();
      assert.ok(msg === 'generate injection dependency tree fail, err = hello to_dot error');
    });

    it('should loadMidwayController be ok', async () => {
      const loader = new MidwayWebLoader({
        logger: console,
        baseDir: join(__dirname, './fixtures/enhance/base-app'),
        app: {
          options: {
            baseDir: join(__dirname, './fixtures/enhance/base-app'),
          }
        }
      });
      loader.config = {container: {}};
      loader.loadApplicationContext();
      const applicationContext = loader.applicationContext;
      applicationContext.bind(UserService);
      applicationContext.bind(UserController);
      applicationContext.bind(DbAPI);
      applicationContext.bind(A);
      applicationContext.bind(B);

      saveModule(CONTROLLER_KEY, UserController);
      saveClassMetadata(CONTROLLER_KEY, {
        prefix: null,
        routerOptions: { sensitive: true }
      }, UserController);

      await loader.loadMidwayController();

      let msg = '';
      try {
        await loader.loadMidwayController();
      } catch (e) {
        msg = e.message;
      }
      assert.ok(msg === 'controller identifier [userController] is exists!');
    });
  });
});
