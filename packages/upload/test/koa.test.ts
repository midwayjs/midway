import { createHttpRequest, close, createApp } from '@midwayjs/mock';
import { join } from 'path';
import * as assert from 'assert';
import { statSync } from 'fs';

describe('test/koa.test.ts', function () {

  describe('koa stream', function () {
    let app;
    beforeAll(async () => {
      const appDir = join(__dirname, 'fixtures/koa-stream');
      app = await createApp(appDir);
    });

    afterAll(async () => {
      await close(app);
    });
    it('upload stream mode', async () => {
      const pdfPath = join(__dirname, 'fixtures/test.pdf');
      const request = await createHttpRequest(app);
      await request.post('/upload')
        .field('name', 'form')
        .field('name2', 'form2')
        .attach('file', pdfPath)
        .attach('file2', pdfPath)
        .expect(200)
        .then(async response => {
          const stat = statSync(pdfPath);
          assert.ok(response.body.size === stat.size);
          assert.ok(response.body.files.length === 1);
          assert.ok(response.body.files[0].filename === 'test.pdf');
          assert.ok(response.body.fields.name === 'form');
          assert.ok(response.body.fields.name2 === 'form2');
        });
    });

    it('upload stream mode 3kb', async () => {
      // fix: issue#2309
      // 实际上 supertest 无法模拟出来效果
      const pdfPath = join(__dirname, 'fixtures/3kb.png');
      const request = await createHttpRequest(app);
      await request.post('/upload')
        .attach('file', pdfPath)
        .field('name', 'form')
        .expect(200)
        .then(async response => {
          const stat = statSync(pdfPath);
          assert.ok(response.body.size === stat.size);
          assert.ok(response.body.files.length === 1);
          assert.ok(response.body.files[0].filename === '3kb.png');
        });
    });

    it('upload unsupport ext file using stream', async () => {
      const filePath = join(__dirname, 'fixtures/1.test');
      const request = await createHttpRequest(app);
      await request.post('/upload')
        .field('name', 'form')
        .field('name2', 'form2')
        .attach('file', filePath)
        .expect(400);
    });
  });

  describe('koa file', function () {
    let app;
    beforeAll(async () => {
      const appDir = join(__dirname, 'fixtures/koa-file');
      app = await createApp(appDir);
    });

    afterAll(async () => {
      await close(app);
    });

    it('upload file mode', async () => {
      const pdfPath = join(__dirname, 'fixtures/test.pdf');
      const request = await createHttpRequest(app);
      await request.post('/upload')
        .field('name', 'form')
        .field('name2', 'form2')
        .attach('file', pdfPath)
        .attach('file2', pdfPath)
        .expect(200)
        .then(async response => {
          assert.ok(response.body.files.length === 2);
          assert.ok(response.body.files[0].fieldName === 'file');
          assert.ok(response.body.files[1].fieldName === 'file2');
          assert.ok(response.body.files[1].mimeType === 'application/pdf');
          assert.ok(response.body.fields.name === 'form');
          assert.ok(response.body.fields.name2 === 'form2');
        });
    });

    it('upload file type .tar.gz', async () => {
      const path = join(__dirname, 'fixtures/1.tar.gz');
      const request = await createHttpRequest(app);
      await request.post('/upload')
        .field('name', 'form')
        .field('name2', 'form2')
        .attach('file', path)
        .expect(200)
        .then(async response => {
          const stat = statSync(path);
          assert.ok(response.body.size === stat.size);
          assert.ok(response.body.files[0].data.endsWith('.tar.gz'));
        });
    });

    it('upload unsupported ext file using file', async () => {
      const filePath = join(__dirname, 'fixtures/1.test');
      const request = await createHttpRequest(app);
      await request.post('/upload')
        .field('name', 'form')
        .field('name2', 'form2')
        .attach('file', filePath)
        .expect(400);
    });

  });

  describe('koa file mime', function () {
    let app;
    beforeAll(async () => {
      const appDir = join(__dirname, 'fixtures/koa-file-mime');
      app = await createApp(appDir);
    });

    afterAll(async () => {
      await close(app);
    });

    it('invalid file type', async () => {
      const filePath = join(__dirname, 'fixtures/err.jpg');
      const request = await createHttpRequest(app);
      await request.post('/upload')
        .field('name', 'form')
        .field('name2', 'form2')
        .attach('file', filePath)
        .expect(400);
    });

    it('invalid file type', async () => {
      const filePath = join(__dirname, 'fixtures/1.from-jpg.png');
      const request = await createHttpRequest(app);
      await request.post('/upload')
        .field('name', 'form')
        .field('name2', 'form2')
        .attach('file', filePath)
        .expect(400);
    });

    it('normal file type', async () => {
      const filePath = join(__dirname, 'fixtures/1.jpg');
      const request = await createHttpRequest(app);
      await request.post('/upload')
        .field('name', 'form')
        .field('name2', 'form2')
        .attach('file', filePath)
        .expect(200);
    });

    it('normal file type 2', async () => {
      const filePath = join(__dirname, 'fixtures/1.more');
      const request = await createHttpRequest(app);
      await request.post('/upload')
        .field('name', 'form')
        .field('name2', 'form2')
        .attach('file', filePath)
        .expect(200);
    });
  });

  describe('test null set', function () {
    it('upload test ext set null', async () => {
      const appDir = join(__dirname, 'fixtures/koa-ext-null');
      const app = await createApp(appDir);
      const filePath = join(__dirname, 'fixtures/1.test');
      const request = await createHttpRequest(app);
      await request.post('/upload')
        .field('name', 'form')
        .field('name2', 'form2')
        .attach('file', filePath)
        .expect(200);

      await close(app);
    });
  });

  describe('koa function whitelist and mimeTypeWhiteList', function () {
    let app;
    beforeAll(async () => {
      const appDir = join(__dirname, 'fixtures/koa-function-whitelist');
      app = await createApp(appDir);
    });

    afterAll(async () => {
      await close(app);
    });

    it('upload with function whitelist and mimeTypeWhiteList', async () => {
      const filePath = join(__dirname, 'fixtures/test.pdf');
      const request = await createHttpRequest(app);
      await request.post('/upload')
        .field('name', 'form')
        .field('name2', 'form2')
        .attach('file', filePath)
        .expect(200)
        .then(async response => {
          assert(response.body.files.length === 1);
          assert(response.body.files[0].filename === 'test.pdf');
          assert(response.body.fields.name === 'form');
          assert(response.body.fields.name2 === 'form2');
        });
    });
  });

  describe('koa function with duplicate fields', function () {
    let app;
    beforeAll(async () => {
      const appDir = join(__dirname, 'fixtures/koa-function-duplicate-fields');
      app = await createApp(appDir);
    });

    afterAll(async () => {
      await close(app);
    });

    it('allow fields duplication', async () => {
      const filePath = join(__dirname, 'fixtures/test.pdf');
      const request = await createHttpRequest(app);
      await request.post('/upload')
        .field('name', 'form')
        .field('name', 'form2')
        .field('nameOther', 'other')
        .attach('file', filePath)
        .expect(200)
        .then(async response => {
          assert(response.body.files.length === 1);
          assert(response.body.files[0].filename === 'test.pdf');
          assert(JSON.stringify(response.body.fields.name) === JSON.stringify(['form', 'form2']));
          assert(response.body.fields.nameOther === 'other');
        });
    });
  });
});
