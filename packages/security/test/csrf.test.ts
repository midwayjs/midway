
import { createHttpRequest, close, createApp, createFunctionApp } from '@midwayjs/mock';
import { join } from 'path';
import * as assert from 'assert';
import { readFileSync, copy, writeFile, remove } from 'fs-extra';
import { existsSync } from 'fs';

const postWithCsrfToken = async app => {
  const request = await createHttpRequest(app);
  const response = await request.get('/csrf').expect(200);
  const csrfToken = response.text;
  assert.ok(response.text);
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


const postWithCsrfTokenSetToQuery = async app => {
  const request = await createHttpRequest(app);
  const response = await request.get('/csrf').expect(200);
  const csrfToken = response.text;
  assert.ok(response.text);
  const body = {
    test: Date.now()
  };
  await request.post(`/body?_csrf=${csrfToken}`)
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
  assert.ok(response.text && preResponse.text !== response.text);
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

const return403WithoutCsrfToken = async app => {
  const request = await createHttpRequest(app);
  const response = await request.get('/csrf').expect(200);
  assert.ok(response.text);
  const body = {
    test: Date.now()
  };
  await request.post(`/body`)
    .send(body)
    .expect(403);
}

const return200WithCorrectRefererWhenTypeIsReferer = async app => {
  const request = await createHttpRequest(app);
  const response = await request.get('/csrf').expect(200);
  const csrfToken = response.text;
  assert.ok(response.text);
  const body = {
    _csrf: csrfToken,
    test: Date.now()
  };
  await request.post('/body')
    .set('Cookie', response.headers['set-cookie'])
    .set('referer', 'https://midwayjs.org/docs/')
    .send(body)
    .expect(200)
    .expect(body);
}

const return403WithIncorrectRefererWhenTypeIsReferer = async app => {
  const request = await createHttpRequest(app);
  const response = await request.get('/csrf').expect(200);
  const csrfToken = response.text;
  assert.ok(response.text);
  const body = {
    _csrf: csrfToken,
    test: Date.now()
  };
  await request.post('/body')
    .set('Cookie', response.headers['set-cookie'])
    .set('referer', 'https://midway.org/docs/')
    .send(body)
    .expect(403);
}

const postWithCsrfTokenSetToBodyUsingSession = async app => {
  const request = await createHttpRequest(app);
  const response = await request.get('/csrf').expect(200);
  const csrfToken = response.text;
  assert.ok(response.text);
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
  const csrfBase = join(__dirname, 'fixtures/base');
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

    it('post with csrf token set to query', async () => {
      await postWithCsrfTokenSetToQuery(app);
    });

    it('post with csrf token rotate', async () => {
      await postWithCsrfTokenRotate(app)
    });

    it('should return 403 without csrf token', async () => {
      await return403WithoutCsrfToken(app);
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

    it('post with csrf token set to query', async () => {
      await postWithCsrfTokenSetToQuery(app);
    });

    it('post with csrf token rotate', async () => {
      await postWithCsrfTokenRotate(app)
    });

    it('should return 403 without csrf token', async () => {
      await return403WithoutCsrfToken(app);
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

    it('post with csrf token set to query', async () => {
      await postWithCsrfTokenSetToQuery(app);
    });

    it('post with csrf token rotate', async () => {
      await postWithCsrfTokenRotate(app)
    });

    it('should return 403 without csrf token', async () => {
      await return403WithoutCsrfToken(app);
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
      app = await createFunctionApp(appDir, {});
    });

    afterAll(async () => {
      await close(app);
    });
    it.only('post with csrf token', async () => {
      await postWithCsrfToken(app);
    });


    it('post with csrf token set to query', async () => {
      await postWithCsrfTokenSetToQuery(app);
    });

    it('post with csrf token rotate', async () => {
      await postWithCsrfTokenRotate(app)
    });

    it('should return 403 without csrf token', async () => {
      await return403WithoutCsrfToken(app);
    });
  });

  describe('faas referer', function () {
    let app;
    beforeAll(async () => {
      const appDir = join(__dirname, `fixtures/csrf-tmp/faas-referer`);
      const config = join(appDir, 'src/config/config.default.ts');
      const configuration = join(appDir, 'src/configuration.ts');
      if (existsSync(appDir)) {
        await remove(appDir);
      }
      await copy(csrfBase, appDir);
      await writeFile(configuration, csrfConfigurationCode.replace(/\$\{\s*framework\s*\}/g, `@midwayjs/faas`));
      await writeFile(config, readFileSync(config, 'utf-8') + `\nexport const security = { csrf: {type: 'all', refererWhiteList: ['.midwayjs.org']}};`);
      app = await createFunctionApp(appDir, {});
    });

    afterAll(async () => {
      await close(app);
    });

    it('should return 200 with correct referer when type is referer', async () => {
      await return200WithCorrectRefererWhenTypeIsReferer(app);
    });

    it('should return 403 with incorrect referer when type is referer', async () => {
      await return403WithIncorrectRefererWhenTypeIsReferer(app);
    });
  });

  describe('koa referer', function () {
    let app;
    beforeAll(async () => {
      const appDir = join(__dirname, `fixtures/csrf-tmp/koa-referer`);
      const config = join(appDir, 'src/config/config.default.ts');
      const configuration = join(appDir, 'src/configuration.ts');
      if (existsSync(appDir)) {
        await remove(appDir);
      }
      await copy(csrfBase, appDir);
      await remove(join(appDir, 'f.yml'));
      await writeFile(configuration, csrfConfigurationCode.replace(/\$\{\s*framework\s*\}/g, `@midwayjs/koa`));
      await writeFile(config, readFileSync(config, 'utf-8') + `\nexport const security = { csrf: {type: 'all', refererWhiteList: ['.midwayjs.org']}};`);
      app = await createApp(appDir);
    });

    afterAll(async () => {
      await close(app);
    });

    it('should return 200 with correct referer when type is referer', async () => {
      await return200WithCorrectRefererWhenTypeIsReferer(app);
    });

    it('should return 403 with incorrect referer when type is referer', async () => {
      await return403WithIncorrectRefererWhenTypeIsReferer(app);
    });
  });

  describe('express referer', function () {
    let app;
    beforeAll(async () => {
      const appDir = join(__dirname, `fixtures/csrf-tmp/express-referer`);
      const config = join(appDir, 'src/config/config.default.ts');
      const configuration = join(appDir, 'src/configuration.ts');
      if (existsSync(appDir)) {
        await remove(appDir);
      }
      await copy(csrfBase, appDir);
      await remove(join(appDir, 'f.yml'));
      await writeFile(configuration, csrfConfigurationCode.replace(/\$\{\s*framework\s*\}/g, `@midwayjs/express`));
      await writeFile(config, readFileSync(config, 'utf-8') + `\nexport const security = { csrf: {type: 'all', refererWhiteList: ['.midwayjs.org']}};`);
      app = await createApp(appDir);
    });

    afterAll(async () => {
      await close(app);
    });

    it('should return 200 with correct referer when type is referer', async () => {
      await return200WithCorrectRefererWhenTypeIsReferer(app);
    });

    it('should return 403 with incorrect referer when type is referer', async () => {
      await return403WithIncorrectRefererWhenTypeIsReferer(app);
    });
  });

  describe('web referer', function () {
    let app;
    beforeAll(async () => {
      const appDir = join(__dirname, `fixtures/csrf-tmp/web-referer`);
      const config = join(appDir, 'src/config/config.default.ts');
      const configuration = join(appDir, 'src/configuration.ts');
      if (existsSync(appDir)) {
        await remove(appDir);
      }
      await copy(csrfBase, appDir);
      await remove(join(appDir, 'f.yml'));
      await writeFile(configuration, csrfConfigurationCode.replace(/\$\{\s*framework\s*\}/g, `@midwayjs/web`));
      await writeFile(config, readFileSync(config, 'utf-8') + `\nexport const security = { csrf: {type: 'all', refererWhiteList: ['.midwayjs.org']}};`);
      app = await createApp(appDir);
    });

    afterAll(async () => {
      await close(app);
    });

    it('should return 200 with correct referer when type is referer', async () => {
      await return200WithCorrectRefererWhenTypeIsReferer(app);
    });

    it('should return 403 with incorrect referer when type is referer', async () => {
      await return403WithIncorrectRefererWhenTypeIsReferer(app);
    });
  });


  describe('express session', function () {
    let app;
    beforeAll(async () => {
      const appDir = join(__dirname, `fixtures/csrf-tmp/express-session`);
      const config = join(appDir, 'src/config/config.default.ts');
      const configuration = join(appDir, 'src/configuration.ts');
      if (existsSync(appDir)) {
        await remove(appDir);
      }
      await copy(csrfBase, appDir);
      await remove(join(appDir, 'f.yml'));
      await writeFile(configuration, csrfConfigurationCode.replace(/\$\{\s*framework\s*\}/g, `@midwayjs/express`));
      await writeFile(config, readFileSync(config, 'utf-8') + `\nexport const security = { csrf: {useSession: true}};`);
      app = await createApp(appDir);
    });

    afterAll(async () => {
      await close(app);
    });

    it('post with csrf token set to query using session', async () => {
      await postWithCsrfTokenSetToBodyUsingSession(app);
    });
  });

  describe('koa session', function () {
    let app;
    beforeAll(async () => {
      const appDir = join(__dirname, `fixtures/csrf-tmp/koa-session`);
      const config = join(appDir, 'src/config/config.default.ts');
      const configuration = join(appDir, 'src/configuration.ts');
      if (existsSync(appDir)) {
        await remove(appDir);
      }
      await copy(csrfBase, appDir);
      await remove(join(appDir, 'f.yml'));
      await writeFile(configuration, csrfConfigurationCode.replace(/\$\{\s*framework\s*\}/g, `@midwayjs/koa`));
      await writeFile(config, readFileSync(config, 'utf-8') + `\nexport const security = { csrf: {useSession: true}};`);
      app = await createApp(appDir);
    });

    afterAll(async () => {
      await close(app);
    });

    it('post with csrf token set to query using session', async () => {
      await postWithCsrfTokenSetToBodyUsingSession(app);
    });
  });

  describe('web session', function () {
    let app;
    beforeAll(async () => {
      const appDir = join(__dirname, `fixtures/csrf-tmp/web-session`);
      const config = join(appDir, 'src/config/config.default.ts');
      const configuration = join(appDir, 'src/configuration.ts');
      if (existsSync(appDir)) {
        await remove(appDir);
      }
      await copy(csrfBase, appDir);
      await remove(join(appDir, 'f.yml'));
      await writeFile(configuration, csrfConfigurationCode.replace(/\$\{\s*framework\s*\}/g, `@midwayjs/web`));
      await writeFile(config, readFileSync(config, 'utf-8') + `\nexport const security = { csrf: {useSession: true}};`);
      app = await createApp(appDir);
    });

    afterAll(async () => {
      await close(app);
    });

    it('post with csrf token set to query using session', async () => {
      await postWithCsrfTokenSetToBodyUsingSession(app);
    });
  });
});
