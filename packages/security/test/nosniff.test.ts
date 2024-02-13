
import { close, createApp, createFunctionApp, createHttpRequest } from '@midwayjs/mock';
import { join } from 'path';
import * as assert from 'assert';
import * as ServerlessApp from '../../../packages-legacy/serverless-app/src';
import { readFileSync, copy, writeFile, remove } from 'fs-extra';
import { existsSync } from 'fs';
const type = 'nosniff';


const withnosniffHeader = async app => {
  const request = await createHttpRequest(app);
  await request.get('/').expect(200).expect('X-Content-Type-Options', 'nosniff');
}

const redirectIgnoreSniff = async app => {
  const request = await createHttpRequest(app);
  const response = await request.get('/redirect').expect(302).expect('location', '/');
  assert.ok(!response.headers['X-Content-Type-Options']);
}

describe(`test/${type}.test.ts`, function () {
  const csrfBase = join(__dirname, 'fixtures/base');
  const csrfConfigurationCode = readFileSync(join(csrfBase, 'src/configuration.ts')).toString();

  afterAll(async () => {
    await remove(join(__dirname, `fixtures/${type}-tmp`));
  });
  describe('koa', function () {
    let app;
    beforeAll(async () => {
      const appDir = join(__dirname, `fixtures/${type}-tmp/koa`);
      const config = join(appDir, 'src/config/config.default.ts');
      const configuration = join(appDir, 'src/configuration.ts');
      if (existsSync(appDir)) {
        await remove(appDir);
      }
      await copy(csrfBase, appDir);
      await remove(join(appDir, 'f.yml'));
      await writeFile(configuration, csrfConfigurationCode.replace(/\$\{\s*framework\s*\}/g, `@midwayjs/koa`));
      await writeFile(config, readFileSync(config, 'utf-8') + `\nexport const security = { nosniff: { enable: true }};`);
      app = await createApp(appDir);
    });

    afterAll(async () => {
      await close(app);
    });
    it('with nosniff header', async () => {
      await withnosniffHeader(app);
    });

    it('redirect ignore nosniff header', async () => {
      await redirectIgnoreSniff(app);
    });

  });

  describe('web', function () {
    let app;
    beforeAll(async () => {
      const appDir = join(__dirname, `fixtures/${type}-tmp/web`);
      const config = join(appDir, 'src/config/config.default.ts');
      const configuration = join(appDir, 'src/configuration.ts');
      if (existsSync(appDir)) {
        await remove(appDir);
      }
      await copy(csrfBase, appDir);
      await remove(join(appDir, 'f.yml'));
      await writeFile(configuration, csrfConfigurationCode.replace(/\$\{\s*framework\s*\}/g, `@midwayjs/web`));
      await writeFile(config, readFileSync(config, 'utf-8') + `\nexport const security = {nosniff: { enable: true }};`);
      app = await createApp(appDir);
    });

    afterAll(async () => {
      await close(app);
    });
    it('with nosniff header', async () => {
      await withnosniffHeader(app);
    });

    it('redirect ignore nosniff header', async () => {
      await redirectIgnoreSniff(app);
    });

  });


  describe('express', function () {
    let app;
    beforeAll(async () => {
      const appDir = join(__dirname, `fixtures/${type}-tmp/express`);
      const config = join(appDir, 'src/config/config.default.ts');
      const configuration = join(appDir, 'src/configuration.ts');
      if (existsSync(appDir)) {
        await remove(appDir);
      }
      await copy(csrfBase, appDir);
      await remove(join(appDir, 'f.yml'));
      await writeFile(configuration, csrfConfigurationCode.replace(/\$\{\s*framework\s*\}/g, `@midwayjs/express`));
      await writeFile(config, readFileSync(config, 'utf-8') + `\nexport const security = {nosniff: { enable: true }};`);
      app = await createApp(appDir);
    });

    afterAll(async () => {
      await close(app);
    });
    it('with nosniff header', async () => {
      await withnosniffHeader(app);
    });

    it('redirect ignore nosniff header', async () => {
      await redirectIgnoreSniff(app);
    });
  });

  describe('faas', function () {
    let app;
    beforeAll(async () => {
      const appDir = join(__dirname, `fixtures/${type}-tmp/faas`);
      const config = join(appDir, 'src/config/config.default.ts');
      const configuration = join(appDir, 'src/configuration.ts');
      if (existsSync(appDir)) {
        await remove(appDir);
      }
      await copy(csrfBase, appDir);
      await writeFile(configuration, csrfConfigurationCode.replace(/\$\{\s*framework\s*\}/g, `@midwayjs/faas`));
      await writeFile(config, readFileSync(config, 'utf-8') + `\nexport const security = {nosniff: { enable: true }};`);
      app = await createFunctionApp<ServerlessApp.Framework>(appDir, {}, ServerlessApp);
    });

    afterAll(async () => {
      await close(app);
    });

    it('with nosniff header', async () => {
      await withnosniffHeader(app);
    });

    it('redirect ignore nosniff header', async () => {
      await redirectIgnoreSniff(app);
    });
  });

});
