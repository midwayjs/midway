
import { createHttpRequest, close, createApp, createFunctionApp } from '@midwayjs/mock';
import { join } from 'path';
import * as ServerlessApp from '../../../packages-serverless/serverless-app/src';
import * as assert from 'assert';
import { readFileSync, copy, writeFile, remove } from 'fs-extra';
import { existsSync } from 'fs';

const postWithCsrfToken = async app => {
  const request = await createHttpRequest(app);
  const response = await request.get('/csrf').expect(200);
  const csrfToken = response.text;
  assert(response.text);
  const body = {
    _csrf: csrfToken,
    test: Date.now()
  };
  await request.post('/body')
    .set('Cookie', response.headers['set-cookie'])
    .send(body)
    .expect(200)
    .expect(body);
}

const postWithCsrfTokenRotate = async app => {
  const request = await createHttpRequest(app);
  const preResponse = await request.get('/csrf').expect(200);
  const response = await request.get('/rotate').expect(200);
  const csrfToken = response.text;
  assert(response.text && preResponse.text !== response.text);
  const body = {
    _csrf: csrfToken,
    test: Date.now()
  };
  await request.post('/body')
    .set('Cookie', response.headers['set-cookie'])
    .send(body)
    .expect(200)
    .expect(body);
}


describe('test/csrf.test.ts', function () {
  const csrfBase = join(__dirname, 'fixtures/csrf');
  const csrfConfigurationCode = readFileSync(join(csrfBase, 'src/configuration.ts')).toString();

  afterAll(async () => {
    await remove(join(__dirname, `fixtures/csrf-tmp`));
  });
  describe('koa', function () {
    let app;
    beforeAll(async () => {
      const appDir = join(__dirname, `fixtures/csrf-tmp/koa`);
      const configuration = join(appDir, 'src/configuration.ts');
      if (existsSync(appDir)) {
        await remove(appDir);
      }
      await copy(csrfBase, appDir);
      await remove(join(appDir, 'f.yml'));
      await writeFile(configuration, csrfConfigurationCode.replace(/\$\{\s*framework\s*\}/g, `@midwayjs/koa`)); 
      app = await createApp(appDir);
    });
  
    afterAll(async () => {
      await close(app);
    });
    it('post with csrf token', async () => {
      await postWithCsrfToken(app);
    });
  
    it('post with csrf token rotate', async () => {
      await postWithCsrfTokenRotate(app)
    });
  });

  describe('web', function () {
    let app;
    beforeAll(async () => {
      const appDir = join(__dirname, `fixtures/csrf-tmp/web`);
      const configuration = join(appDir, 'src/configuration.ts');
      if (existsSync(appDir)) {
        await remove(appDir);
      }
      await copy(csrfBase, appDir);
      await remove(join(appDir, 'f.yml'));
      await writeFile(configuration, csrfConfigurationCode.replace(/\$\{\s*framework\s*\}/g, `@midwayjs/web`)); 
      app = await createApp(appDir);
    });
  
    afterAll(async () => {
      await close(app);
    });
    it('post with csrf token', async () => {
      await postWithCsrfToken(app);
    });
  
    it('post with csrf token rotate', async () => {
      await postWithCsrfTokenRotate(app)
    });
  });

  describe('express', function () {
    let app;
    beforeAll(async () => {
      const appDir = join(__dirname, `fixtures/csrf-tmp/express`);
      const configuration = join(appDir, 'src/configuration.ts');
      if (existsSync(appDir)) {
        await remove(appDir);
      }
      await copy(csrfBase, appDir);
      await remove(join(appDir, 'f.yml'));
      await writeFile(configuration, csrfConfigurationCode.replace(/\$\{\s*framework\s*\}/g, `@midwayjs/express`)); 
      app = await createApp(appDir);
    });
  
    afterAll(async () => {
      await close(app);
    });
    it('post with csrf token', async () => {
      await postWithCsrfToken(app);
    });
  
    it('post with csrf token rotate', async () => {
      await postWithCsrfTokenRotate(app)
    });
  });

  describe('faas', function () {
    let app;
    beforeAll(async () => {
      const appDir = join(__dirname, `fixtures/csrf-tmp/faas`);
      const configuration = join(appDir, 'src/configuration.ts');
      if (existsSync(appDir)) {
        await remove(appDir);
      }
      await copy(csrfBase, appDir);
      await writeFile(configuration, csrfConfigurationCode.replace(/\$\{\s*framework\s*\}/g, `@midwayjs/faas`)); 
      app = await createFunctionApp<ServerlessApp.Framework>(appDir, {}, ServerlessApp);
    });
  
    afterAll(async () => {
      await close(app);
    });
    it('post with csrf token', async () => {
      await postWithCsrfToken(app);
    });
  
    it('post with csrf token rotate', async () => {
      await postWithCsrfTokenRotate(app)
    });
  });
});
