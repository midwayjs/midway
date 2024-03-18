import { join } from 'path';
import { existsSync, unlinkSync } from 'fs';
import {
  close,
  createApp,
  createLightApp,
  createHttpRequest,
} from '@midwayjs/mock';
import { IMidwayApplication } from '@midwayjs/core';

describe('/test/index.test.ts', () => {
  if (/v12/.test(process.version)) {
    it('should ignore mikro test', () => {
      console.log('not support current node version');
    });
  } else {
    it('should test base entity', async () => {
      cleanFile(join(__dirname, 'fixtures/base-fn-origin', 'test.sqlite'));

      const app: IMidwayApplication = await createLightApp(
        join(__dirname, 'fixtures/base-fn-origin'),
        {}
      );
      const result = app.getAttr<string>('result');

      expect(result.includes('b1')).toBeTruthy();

      await close(app);
    });

    it('test multi entity manager in different component', async () => {
      cleanFile(join(__dirname, 'fixtures/multi-enitymanager', 'test.sqlite'));
      cleanFile(join(__dirname, 'fixtures/multi-enitymanager', 'test1.sqlite'));

      const app: IMidwayApplication = await createApp(
        join(__dirname, 'fixtures/multi-enitymanager'),
        {}
      );
      let result = await createHttpRequest(app).get('/m1').expect(200);
      expect(result.text).toEqual('[]');

      result = await createHttpRequest(app).get('/m1/withEntity').expect(200);
      expect(result.text).toEqual('[]');

      result = await createHttpRequest(app).get('/').expect(200);
      expect(result.text).toEqual('[[],[]]');

      await close(app);
    });
  }
});

function cleanFile(file) {
  if (existsSync(file)) {
    unlinkSync(file);
  }
}
