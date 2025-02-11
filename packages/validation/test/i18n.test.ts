import { createLegacyApp, close, createHttpRequest } from '@midwayjs/mock';
import { join } from 'path';
import * as validation from '../src';
import { mockValidationService } from './mock';

describe('test/i18n.test.ts', function () {
  it('should test with locale in decorator options', async () => {
    const app = await createLegacyApp(join(__dirname, 'fixtures/base-app-koa'));
    const validationServiceStore = app.getApplicationContext().get(validation.ValidationServiceStore);
    validationServiceStore.setValidationService(mockValidationService);
    const result = await createHttpRequest(app)
      .post('/user/')
      .send({
        name: 'abcdefghijklmn',
      });

    expect(result.body.message).toEqual('String must contain at most 10 character(s)');
    expect(result.body.locale).toEqual('zh_CN');
    await close(app);
  });

  it('should test with locale global options', async () => {
    const app = await createLegacyApp(join(__dirname, 'fixtures/base-app-koa-global-locale'));
    const validationServiceStore = app.getApplicationContext().get(validation.ValidationServiceStore);
    validationServiceStore.setValidationService(mockValidationService);
    const result = await createHttpRequest(app)
      .post('/user/global_options')
      .send({
        name: 'abcdefghijklmn',
      });

    expect(result.body.message).toEqual('String must contain at most 10 character(s)');
    expect(result.body.locale).toEqual('zh-cn');
    await close(app);
  });

  it('should test with query locale', async () => {
    const app = await createLegacyApp(join(__dirname, 'fixtures/base-app-koa-query-locale'));
    const validationServiceStore = app.getApplicationContext().get(validation.ValidationServiceStore);
    validationServiceStore.setValidationService(mockValidationService);
    const result = await createHttpRequest(app)
      .post('/user/')
      .query({
        locale: 'zh_CN'
      })
      .send({
        name: 'abcdefghijklmn',
      });

    expect(result.body.message).toEqual('String must contain at most 10 character(s)');
    expect(result.body.locale).toEqual('zh-cn');
    await close(app);
  });

  it('should test with locale fallback', async () => {
    const app = await createLegacyApp(join(__dirname, 'fixtures/base-app-koa-fallback'));
    const validationServiceStore = app.getApplicationContext().get(validation.ValidationServiceStore);
    validationServiceStore.setValidationService(mockValidationService);
    const result = await createHttpRequest(app)
      .post('/user/')
      .send({
        name: 'abcdefghijklmn',
      });

    expect(result.body.message).toEqual('String must contain at most 10 character(s)');
    expect(result.body.locale).toEqual('tr_TR');
    await close(app);
  });
});
