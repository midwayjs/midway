import { createHttpRequest, close, createApp } from '@midwayjs/mock';
import { join } from 'path';
import * as assert from 'assert';

describe('test/koa.test.ts', function () {

  it('upload stream mode', async () => {
    const appDir = join(__dirname, 'fixtures/koa-stream');
    const imagePath = join(__dirname, 'fixtures/test.pdf');
    const app = await createApp(appDir);
    const request = await createHttpRequest(app);
    await request.post('/upload')
      .field('name', 'form')
      .field('name2', 'form2')
      .attach('file', imagePath)
      .attach('file2', imagePath)
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
    const appDir = join(__dirname, 'fixtures/koa-file');
    const imagePath = join(__dirname, 'fixtures/test.pdf');
    const app = await createApp(appDir);
    const request = await createHttpRequest(app);
    await request.post('/upload')
      .field('name', 'form')
      .field('name2', 'form2')
      .attach('file', imagePath)
      .attach('file2', imagePath)
      .expect(200)
      .then(async response => {
        assert(response.body.files.length === 2);
        assert(response.body.files[0].fieldname === 'file');
        assert(response.body.files[1].fieldname === 'file2');
        assert(response.body.files[1].mimeType === 'application/pdf');
        assert(response.body.fields.name === 'form');
        assert(response.body.fields.name2 === 'form2');
      });
    await close(app);
  });
});
