import { close, createLightApp, createLegacyLightApp } from '@midwayjs/mock';
import { join } from 'path';
import { existsSync, unlinkSync } from 'fs';
import { UserService } from './fixtures/sequelize-new/src/service/user';
import * as sequelize from '../src';

function cleanFile(file) {
  if (existsSync(file)) {
    unlinkSync(file);
  }
}

describe('/test/index.test.ts', () => {
  describe('test sequelize with new decorator', () => {
    let app;
    beforeAll(async () => {
      cleanFile(join(__dirname, 'fixtures/sequelize-new', 'database.sqlite'));
      app = await createLegacyLightApp(
        join(__dirname, 'fixtures', 'sequelize-new'),
        {},
      );
    });

    afterAll(async () => {
      await close(app);
    });
    it('list user service ', async () => {
      const userService: UserService = await app
        .getApplicationContext()
        .getAsync(UserService);
      const result = await userService.list();
      expect(result.length).toBe(0);
    });

    it('list hello service ', async () => {
      const userService: UserService = await app
        .getApplicationContext()
        .getAsync(UserService);
      const result = await userService.listHello();
      expect(result.length).toBe(0);
    });

    it('add and delete', async () => {
      const userService: UserService = await app
        .getApplicationContext()
        .getAsync(UserService);
      await userService.add();
      let result = await userService.list();
      expect(result.length).toBe(1);

      result = await userService.listWithModel();
      expect(result.length).toBe(1);

      await userService.delete();
      result = await userService.list();
      expect(result.length).toBe(0);
    });
  });

  describe('test connection options', () => {
    it('should test connection fail and create client success', async () => {
      const app = await createLightApp({
        imports: [
          sequelize,
        ],
        globalConfig: {
          sequelize: {
            dataSource: {
              default: {
                database: 'test',
                username: 'test',
                password: 'test',
                dialect: 'mysql',
                host: '',
                port: 3306,
                validateConnection: false,  
              },
            },
          },
        },
      });

      const manager = await app.getApplicationContext().getAsync(sequelize.SequelizeDataSourceManager);
      expect(manager.getAllDataSources().size).toBe(1);
    });

    it('should test connection fail and create client fail', async () => {
      let err: Error;
      try {
        await createLightApp({
          imports: [
            sequelize,
          ],
          globalConfig: {
            sequelize: {
              dataSource: {
                default: {
                  database: 'test',
                  username: 'test',
                  password: 'test',
                  dialect: 'mysql',
                  host: '',
                  port: 3306,
                },
              },
            },
          },
        });
      } catch (e) {
        err = e;
      }
      expect(err.name).toEqual('MidwayCommonError');
    });
  })
});
