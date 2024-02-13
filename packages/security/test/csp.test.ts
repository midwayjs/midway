
import { close, createApp, createFunctionApp, createHttpRequest } from '@midwayjs/mock';
import { join } from 'path';
import * as ServerlessApp from '../../../packages-legacy/serverless-app/src';
import { readFileSync, copy, writeFile, remove } from 'fs-extra';
import { existsSync } from 'fs';
import * as assert from 'assert';
const type = 'csp';

const withcspHeader = async app => {
  const request = await createHttpRequest(app);
  const response = await request.get('/csp').expect(200);
  const header = response.headers['content-security-policy'];
  assert.ok(header === `script-src 'self' 'unsafe-inline' 'unsafe-eval' https://apis.midwayjs.org 'nonce-${response.text}';style-src 'unsafe-inline' https://apis.midwayjs.org`);
}

describe(`test/${type}.test.ts`, function () {
  const csrfBase = join(__dirname, 'fixtures/base');
  const csrfConfigurationCode = readFileSync(join(csrfBase, 'src/configuration.ts')).toString();
  const cspConfig = JSON.stringify({
    enable: true,
    policy: {
      'script-src': [`'self'`, `'unsafe-inline'`, `'unsafe-eval'`, 'https://apis.midwayjs.org'],
      'style-src': [`'unsafe-inline'`, 'https://apis.midwayjs.org'],
    }
  });

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
      await writeFile(config, readFileSync(config, 'utf-8') + `\nexport const security = { csp: ${cspConfig}};`);
      app = await createApp(appDir);
    });

    afterAll(async () => {
      await close(app);
    });
    it('with csp header', async () => {
      await withcspHeader(app);
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
      await writeFile(config, readFileSync(config, 'utf-8') + `\nexport const security = {csp: ${cspConfig}};`);
      app = await createApp(appDir);
    });

    afterAll(async () => {
      await close(app);
    });
    it('with csp header', async () => {
      await withcspHeader(app);
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
      await writeFile(config, readFileSync(config, 'utf-8') + `\nexport const security = {csp: ${cspConfig}};`);
      app = await createApp(appDir);
    });

    afterAll(async () => {
      await close(app);
    });
    it('with csp header', async () => {
      await withcspHeader(app);
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
      await writeFile(config, readFileSync(config, 'utf-8') + `\nexport const security = {csp: ${cspConfig}};`);
      app = await createFunctionApp<ServerlessApp.Framework>(appDir, {}, ServerlessApp);
    });

    afterAll(async () => {
      await close(app);
    });

    it('with csp header', async () => {
      await withcspHeader(app);
    });
  });

});
