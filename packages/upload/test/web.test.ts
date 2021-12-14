import { createHttpRequest, close, createApp } from '@midwayjs/mock';
import { join } from 'path';
import * as assert from 'assert';
import { statSync } from 'fs';

describe('test/web.test.ts', function () {

  it('upload stream mode', async () => {
    const appDir = join(__dirname, 'fixtures/web-stream');
    const pdfPath = join(__dirname, 'fixtures/test.pdf');
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
      });
    await close(app);
  });
  it('upload file mode', async () => {
    const appDir = join(__dirname, 'fixtures/web-file');
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
        assert(response.body.files.length === 2);
        assert(response.body.files[0].fieldname === 'file');
        assert(response.body.files[1].fieldname === 'file2');
        assert(response.body.files[1].mimeType === 'application/pdf');
        assert(response.body.fields.name === 'form');
        assert(response.body.fields.name2 === 'form2');
        const file1Stat = statSync(response.body.files[0].data);
        assert(file1Stat.size && file1Stat.size === stat.size);
        const file2Stat = statSync(response.body.files[1].data);
        assert(file2Stat.size && file2Stat.size === stat.size);
      });
    await close(app);
  });
});
