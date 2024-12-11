
import { close, createLegacyApp, createLegacyFunctionApp, createHttpRequest } from '@midwayjs/mock';
import { join } from 'path';
import { readFileSync, copy, writeFile, remove } from 'fs-extra';
import { existsSync } from 'fs';
const type = 'hsts';


const withHSTSHeader = async app => {
  const request = await createHttpRequest(app);
  await request.get('/').expect(200).expect('Strict-Transport-Security', 'max-age=31536000');
}

const withHSTSHeaderIncludeSubdomains = async app => {
  const request = await createHttpRequest(app);
  await request.get('/').expect(200).expect('Strict-Transport-Security', 'max-age=31536000; includeSubdomains');
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
      await writeFile(config, readFileSync(config, 'utf-8') + `\nexport const security = { hsts: { enable: true }};`);
      app = await createLegacyApp(appDir);
    });

    afterAll(async () => {
      await close(app);
    });
    it('with hsts header', async () => {
      await withHSTSHeader(app);
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
      await writeFile(config, readFileSync(config, 'utf-8') + `\nexport const security = {hsts: { enable: true }};`);
      app = await createLegacyApp(appDir);
    });

    afterAll(async () => {
      await close(app);
    });
    it('with hsts header', async () => {
      await withHSTSHeader(app);
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
      await writeFile(config, readFileSync(config, 'utf-8') + `\nexport const security = {hsts: { enable: true }};`);
      app = await createLegacyApp(appDir);
    });

    afterAll(async () => {
      await close(app);
    });
    it('with hsts header', async () => {
      await withHSTSHeader(app);
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
      await writeFile(config, readFileSync(config, 'utf-8') + `\nexport const security = {hsts: { enable: true }};`);
      app = await createLegacyFunctionApp(appDir, {});
    });

    afterAll(async () => {
      await close(app);
    });

    it('with hsts header', async () => {
      await withHSTSHeader(app);
    });
  });


  describe('koa includeSubdomains', function () {
    let app;
    beforeAll(async () => {
      const appDir = join(__dirname, `fixtures/${type}-tmp/koa-includeSubdomains`);
      const config = join(appDir, 'src/config/config.default.ts');
      const configuration = join(appDir, 'src/configuration.ts');
      if (existsSync(appDir)) {
        await remove(appDir);
      }
      await copy(csrfBase, appDir);
      await remove(join(appDir, 'f.yml'));
      await writeFile(configuration, csrfConfigurationCode.replace(/\$\{\s*framework\s*\}/g, `@midwayjs/koa`));
      await writeFile(config, readFileSync(config, 'utf-8') + `\nexport const security = { hsts: { enable: true, includeSubdomains: true }};`);
      app = await createLegacyApp(appDir);
    });

    afterAll(async () => {
      await close(app);
    });
    it('with hsts header', async () => {
      await withHSTSHeaderIncludeSubdomains(app);
    });

  });

  describe('web includeSubdomains', function () {
    let app;
    beforeAll(async () => {
      const appDir = join(__dirname, `fixtures/${type}-tmp/web-includeSubdomains`);
      const config = join(appDir, 'src/config/config.default.ts');
      const configuration = join(appDir, 'src/configuration.ts');
      if (existsSync(appDir)) {
        await remove(appDir);
      }
      await copy(csrfBase, appDir);
      await remove(join(appDir, 'f.yml'));
      await writeFile(configuration, csrfConfigurationCode.replace(/\$\{\s*framework\s*\}/g, `@midwayjs/web`));
      await writeFile(config, readFileSync(config, 'utf-8') + `\nexport const security = {hsts: { enable: true, includeSubdomains: true }};`);
      app = await createLegacyApp(appDir);
    });

    afterAll(async () => {
      await close(app);
    });
    it('with hsts header', async () => {
      await withHSTSHeaderIncludeSubdomains(app);
    });

  });


  describe('express includeSubdomains', function () {
    let app;
    beforeAll(async () => {
      const appDir = join(__dirname, `fixtures/${type}-tmp/express-includeSubdomains`);
      const config = join(appDir, 'src/config/config.default.ts');
      const configuration = join(appDir, 'src/configuration.ts');
      if (existsSync(appDir)) {
        await remove(appDir);
      }
      await copy(csrfBase, appDir);
      await remove(join(appDir, 'f.yml'));
      await writeFile(configuration, csrfConfigurationCode.replace(/\$\{\s*framework\s*\}/g, `@midwayjs/express`));
      await writeFile(config, readFileSync(config, 'utf-8') + `\nexport const security = {hsts: { enable: true, includeSubdomains: true }};`);
      app = await createLegacyApp(appDir);
    });

    afterAll(async () => {
      await close(app);
    });
    it('with hsts header', async () => {
      await withHSTSHeaderIncludeSubdomains(app);
    });
  });

  describe('faas includeSubdomains', function () {
    let app;
    beforeAll(async () => {
      const appDir = join(__dirname, `fixtures/${type}-tmp/faas-includeSubdomains`);
      const config = join(appDir, 'src/config/config.default.ts');
      const configuration = join(appDir, 'src/configuration.ts');
      if (existsSync(appDir)) {
        await remove(appDir);
      }
      await copy(csrfBase, appDir);
      await writeFile(configuration, csrfConfigurationCode.replace(/\$\{\s*framework\s*\}/g, `@midwayjs/faas`));
      await writeFile(config, readFileSync(config, 'utf-8') + `\nexport const security = {hsts: { enable: true, includeSubdomains: true }};`);
      app = await createLegacyFunctionApp(appDir, {});
    });

    afterAll(async () => {
      await close(app);
    });

    it('with hsts header', async () => {
      await withHSTSHeaderIncludeSubdomains(app);
    });
  });


});
