
import { close, createLegacyApp, createLegacyFunctionApp, createHttpRequest } from '@midwayjs/mock';
import { join } from 'path';
import * as assert from 'assert';
import { readFileSync, copy, writeFile, remove } from 'fs-extra';
import { existsSync } from 'fs';
const type = 'base';


const noHSTSHeader = async app => {
  const request = await createHttpRequest(app);
  const response = await request.get('/').expect(200);
  assert.ok(!response.headers['strict-transport-security']);
}

const noNOOpenHeader = async app => {
  const request = await createHttpRequest(app);
  const response = await request.get('/').expect(200);
  assert.ok(!response.headers['x-download-options']);
}

const noSniffHeader = async app => {
  const request = await createHttpRequest(app);
  const response = await request.get('/').expect(200);
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
      await writeFile(config, readFileSync(config, 'utf-8') + `\nexport const security = {};`);
      app = await createLegacyApp(appDir);
    });

    afterAll(async () => {
      await close(app);
    });
    it('no hsts headers', async () => {
      await noHSTSHeader(app);
    });

    it('no noopen headers', async () => {
      await noNOOpenHeader(app);
    });

    it('no nosniff headers', async () => {
      await noSniffHeader(app);
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
      await writeFile(config, readFileSync(config, 'utf-8') + `\nexport const security = {};`);
      app = await createLegacyApp(appDir);
    });

    afterAll(async () => {
      await close(app);
    });
    it('no hsts headers', async () => {
      await noHSTSHeader(app);
    });

    it('no noopen headers', async () => {
      await noNOOpenHeader(app);
    });

    it('no nosniff headers', async () => {
      await noSniffHeader(app);
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
      await writeFile(config, readFileSync(config, 'utf-8') + `\nexport const security = {};`);
      app = await createLegacyApp(appDir);
    });

    afterAll(async () => {
      await close(app);
    });
    it('no hsts headers', async () => {
      await noHSTSHeader(app);
    });

    it('no noopen headers', async () => {
      await noNOOpenHeader(app);
    });

    it('no nosniff headers', async () => {
      await noSniffHeader(app);
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
      await writeFile(config, readFileSync(config, 'utf-8') + `\nexport const security = {};`);
      app = await createLegacyFunctionApp(appDir, {});
    });

    afterAll(async () => {
      await close(app);
    });
    it('no hsts headers', async () => {
      await noHSTSHeader(app);
    });

    it('no noopen headers', async () => {
      await noNOOpenHeader(app);
    });

    it('no nosniff headers', async () => {
      await noSniffHeader(app);
    });
  });
});
