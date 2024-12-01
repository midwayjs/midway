import { createHttpRequest, close, createLegacyApp } from '@midwayjs/mock';
import { join } from 'path';
import * as assert from 'assert';
import { statSync } from 'fs';

describe('test/web.test.ts', function () {

  describe('web stream', function () {
    let app;
    beforeAll(async () => {
      const appDir = join(__dirname, 'fixtures/web-stream');
      app = await createLegacyApp(appDir);
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
          assert.ok(response.body.files.length === 1);
          assert.ok(response.body.files[0].filename === 'test.pdf');
          assert.ok(response.body.fields.name === 'form');
          assert.ok(response.body.fields.name2 === 'form2');
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


  describe('web stream', function () {
    let app;
    beforeAll(async () => {
      const appDir = join(__dirname, 'fixtures/web-file');
      app = await createLegacyApp(appDir);
    });

    afterAll(async () => {
      await close(app);
    });

    it('upload file mode', async () => {
      const pdfPath = join(__dirname, 'fixtures/test.pdf');
      const stat = statSync(pdfPath);
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
          const file1Stat = statSync(response.body.files[0].data);
          assert.ok(file1Stat.size && file1Stat.size === stat.size);
          const file2Stat = statSync(response.body.files[1].data);
          assert.ok(file2Stat.size && file2Stat.size === stat.size);
        });
    });
    
    it('upload unsupport ext file using file', async () => {
      const filePath = join(__dirname, 'fixtures/1.test');
      const request = await createHttpRequest(app);
      await request.post('/upload')
        .field('name', 'form')
        .field('name2', 'form2')
        .attach('file', filePath)
        .expect(400);
    });
  });
});
