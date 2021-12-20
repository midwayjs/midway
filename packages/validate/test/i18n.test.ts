import { createApp, close, createHttpRequest } from '@midwayjs/mock';
import { join } from 'path';

describe('test/i18n.test.ts', function () {
  it('should test with locale in decorator options', async () => {
    const app = await createApp(join(__dirname, 'fixtures/base-app-koa'));
    const result = await createHttpRequest(app)
      .post('/user/')
      .send({
        name: 'abcdefghijklmn',
      });

    expect(result.text).toEqual('"name" 长度必须小于或等于 10 个字符长');
    await close(app);
  });

  it('should test with locale global options', async () => {
    const app = await createApp(join(__dirname, 'fixtures/base-app-koa-global-locale'));
    const result = await createHttpRequest(app)
      .post('/user/global_options')
      .send({
        name: 'abcdefghijklmn',
      });

    expect(result.text).toEqual('"name" 长度必须小于或等于 10 个字符长');
    await close(app);
  });

  it('should test with query locale', async () => {
    const app = await createApp(join(__dirname, 'fixtures/base-app-koa-query-locale'));
    const result = await createHttpRequest(app)
      .post('/user/')
      .query({
        locale: 'zh_CN'
      })
      .send({
        name: 'abcdefghijklmn',
      });

    expect(result.text).toEqual('"name" 长度必须小于或等于 10 个字符长');
    await close(app);
  });

  it('should test with locale fallback', async () => {
    const app = await createApp(join(__dirname, 'fixtures/base-app-koa-fallback'));
    const result = await createHttpRequest(app)
      .post('/user/')
      .send({
        name: 'abcdefghijklmn',
      });

    expect(result.text).toEqual('"name" 长度必须小于或等于 10 个字符长');
    await close(app);
  });

  it('should test with locale fallback use custom message', async () => {
    const app = await createApp(join(__dirname, 'fixtures/base-app-koa-custom-message'));
    const result = await createHttpRequest(app)
      .post('/user/')
      .send({
        name: 'abcdefghijklmn',
      });

    expect(result.text).toEqual('hello world');
    await close(app);
  });

  it('should test invoke joi with message and language', function () {
    const result = require('joi').string().max(10).validate('abcdefghijklmn', {
      messages: {
        'zh_CN': {
          "string.max": "{{#label}} 长度必须小于或等于 {{#limit}} 个字符长",
        }
      },
      errors: {
        language: 'zh_CN'
      }
    });

    expect(result.error.message).toEqual('"value" 长度必须小于或等于 10 个字符长');
  });
});
