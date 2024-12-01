
import { close, createLegacyApp, createLegacyFunctionApp, createHttpRequest } from '@midwayjs/mock';
import { join } from 'path';
import { readFileSync, copy, writeFile, remove } from 'fs-extra';
import { existsSync } from 'fs';
const type = 'xframe';


const withxframeHeader = async app => {
  const request = await createHttpRequest(app);
  await request.get('/').expect(200).expect('X-Frame-Options', 'SAMEORIGIN');
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
      const configuration = join(appDir, 'src/configuration.ts');
      if (existsSync(appDir)) {
        await remove(appDir);
      }
      await copy(csrfBase, appDir);
      await remove(join(appDir, 'f.yml'));
      await writeFile(configuration, csrfConfigurationCode.replace(/\$\{\s*framework\s*\}/g, `@midwayjs/koa`));
      app = await createLegacyApp(appDir);
    });

    afterAll(async () => {
      await close(app);
    });
    it('with xframe header', async () => {
      await withxframeHeader(app);
    });

  });

  describe('web', function () {
    let app;
    beforeAll(async () => {
      const appDir = join(__dirname, `fixtures/${type}-tmp/web`);
      const configuration = join(appDir, 'src/configuration.ts');
      if (existsSync(appDir)) {
        await remove(appDir);
      }
      await copy(csrfBase, appDir);
      await remove(join(appDir, 'f.yml'));
      await writeFile(configuration, csrfConfigurationCode.replace(/\$\{\s*framework\s*\}/g, `@midwayjs/web`));
      app = await createLegacyApp(appDir);
    });

    afterAll(async () => {
      await close(app);
    });
    it('with xframe header', async () => {
      await withxframeHeader(app);
    });

  });


  describe('express', function () {
    let app;
    beforeAll(async () => {
      const appDir = join(__dirname, `fixtures/${type}-tmp/express`);
      const configuration = join(appDir, 'src/configuration.ts');
      if (existsSync(appDir)) {
        await remove(appDir);
      }
      await copy(csrfBase, appDir);
      await remove(join(appDir, 'f.yml'));
      await writeFile(configuration, csrfConfigurationCode.replace(/\$\{\s*framework\s*\}/g, `@midwayjs/express`));
      app = await createLegacyApp(appDir);
    });

    afterAll(async () => {
      await close(app);
    });
    it('with xframe header', async () => {
      await withxframeHeader(app);
    });
  });

  describe('faas', function () {
    let app;
    beforeAll(async () => {
      const appDir = join(__dirname, `fixtures/${type}-tmp/faas`);
      const configuration = join(appDir, 'src/configuration.ts');
      if (existsSync(appDir)) {
        await remove(appDir);
      }
      await copy(csrfBase, appDir);
      await writeFile(configuration, csrfConfigurationCode.replace(/\$\{\s*framework\s*\}/g, `@midwayjs/faas`));
      app = await createLegacyFunctionApp(appDir, {});
    });

    afterAll(async () => {
      await close(app);
    });

    it('with xframe header', async () => {
      await withxframeHeader(app);
    });
  });

});
