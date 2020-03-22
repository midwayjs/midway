import { clearAllModule, MidwayWebLoader } from '../src';
import { A, B, DbAPI } from './fixtures/complex_injection/dbAPI';
import { UserController } from './fixtures/complex_injection/userController';
import { UserService } from './fixtures/complex_injection/userService';
import * as assert from 'assert';
import { join } from 'path';

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

  });
});
