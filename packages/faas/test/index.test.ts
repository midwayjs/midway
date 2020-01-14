import { join } from 'path';
import * as assert from 'assert';
import { createServerlessMock } from './util';
import { FaaSStarter } from '../src/';

describe('test/index.test.ts', () => {
  describe('default value', () => {
    let mock;

    before(async () => {
      mock = await createServerlessMock({
        baseDir: join(__dirname, './fixtures/base-app'),
        typescript: true,
      });
    });

    it('invoke handler by default name', done => {
      return mock
        .handler('index.handler')
        .invoke(
          {
            text: 'hello',
          },
          { text: 'a' }
        )
        .expect(/ahello/, done);
    });

    it('invoke handler by appoint service but no route', done => {
      return mock
        .invoke(
          {
            text: 'hello',
          },
          { text: 'a' }
        )
        .expect(/ahello/, done);
    });
  });

  describe('change default route', () => {
    it('invoke handler by appoint function route', async () => {
      const mock = await createServerlessMock({
        baseDir: join(__dirname, './fixtures/base-app-route'),
      });

      await mock
        .handler('deploy.handler9')
        .invoke(
          {
            text: 'hello',
          },
          { text: 'a' }
        )
        .expect(/ahello/);
    });
  });

  describe('use ioc.js cover loadDir', () => {
    let mock;

    before(async () => {
      mock = await createServerlessMock({
        baseDir: join(__dirname, './fixtures/base-app-ioc'),
        typescript: true,
      });
    });

    it('invoke handler by default name', done => {
      return mock
        .handler('index.handler')
        .invoke(
          {
            text: 'hello',
          },
          { text: 'a' }
        )
        .expect(/ahello/, done);
    });

    it('invoke handler by appoint service but no route', done => {
      return mock
        .invoke(
          {
            text: 'hello',
          },
          { text: 'a' }
        )
        .expect(/ahello/, done);
    });
  });

  describe('use simple lock', () => {
    it('start should exec only once', async () => {
      const faas = new FaaSStarter({
        baseDir: join(__dirname, './fixtures/base-app'),
        typescript: true,
      });

      let i = 0;
      const cb = async () => {
        i++;
      };
      const arr = [faas.start({ cb }), faas.start({ cb }), faas.start({ cb })];
      await Promise.all(arr);
      assert(1 === i);
    });
  });
});
