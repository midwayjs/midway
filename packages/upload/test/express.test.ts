import { createHttpRequest, close, createApp } from '@midwayjs/mock';
import { join } from 'path';
import * as assert from 'assert';
import { statSync } from 'fs';

describe('test/express.test.ts', function () {
  it('upload stream mode', async () => {
    const appDir = join(__dirname, 'fixtures/express-stream');
    const pdfPath = join(__dirname, 'fixtures/test.pdf');
    const stat = statSync(pdfPath);
    const app = await createApp(appDir);
    const request = await createHttpRequest(app);
    await request.post('/upload')
      .field('name', 'form')
      .field('name2', 'form2')
      .attach('file', pdfPath)
      .attach('file2', pdfPath)
      .expect(200)
      .then(async response => {
        assert(response.body.files.length === 1);
        assert(response.body.files[0].filename === 'test.pdf');
        assert(response.body.fields.name === 'form');
        assert(response.body.fields.name2 === 'form2');
        const file1Stat = statSync(response.body.files[0].data);
        assert(file1Stat.size && file1Stat.size === stat.size);
      });
    await close(app);
  });
  it('upload file mode', async () => {
    const appDir = join(__dirname, 'fixtures/express-file');
    const pdfPath = join(__dirname, 'fixtures/test.pdf');
    const app = await createApp(appDir);
    const request = await createHttpRequest(app);
    const stat = statSync(pdfPath);
    await request.post('/upload')
      .field('name', 'form')
      .field('name2', 'form2')
      .attach('file', pdfPath)
      .attach('file2', pdfPath)
      .expect(200)
      .then(async response => {
        assert(response.body.files.length === 2);
        assert(response.body.files[0].fieldName === 'file');
        assert(response.body.files[1].fieldName === 'file2');
        assert(response.body.files[1].mimeType === 'application/pdf');
        assert(response.body.fields.name === 'form');
        assert(response.body.fields.name2 === 'form2');
        const file1Stat = statSync(response.body.files[0].data);
        assert(file1Stat.size && file1Stat.size === stat.size);
      });
    await close(app);
  });
  it('upload unsupport ext file using stream', async () => {
    const appDir = join(__dirname, 'fixtures/express-stream');
    const filePath = join(__dirname, 'fixtures/1.test');
    const app = await createApp(appDir);
    const request = await createHttpRequest(app);
    await request.post('/upload')
      .field('name', 'form')
      .field('name2', 'form2')
      .attach('file', filePath)
      .expect(400);
    await close(app);
  });
  it('upload unsupport ext file using file', async () => {
    const appDir = join(__dirname, 'fixtures/express-file');
    const filePath = join(__dirname, 'fixtures/1.test');
    const app = await createApp(appDir);
    const request = await createHttpRequest(app);
    await request.post('/upload')
      .field('name', 'form')
      .field('name2', 'form2')
      .attach('file', filePath)
      .expect(400);
    await close(app);
  });
});
