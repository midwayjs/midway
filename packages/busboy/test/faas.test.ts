import { createHttpRequest, close, createFunctionApp } from '@midwayjs/mock';
import { join } from 'path';
import * as assert from 'assert';
import { existsSync, statSync } from 'fs';
import { Framework } from '@midwayjs/faas';

describe('test/faas.test.ts', function () {
  let app;
  beforeAll(async () => {
    const appDir = join(__dirname, 'fixtures/faas');
    app = await createFunctionApp<Framework>(appDir, {});
  })

  afterAll(async () => {
    await close(app);
  });

  it('upload file mode', async () => {
    const imagePath = join(__dirname, 'fixtures/1.jpg');
    const request = await createHttpRequest(app);
    const stat = statSync(imagePath);
    await request.post('/upload')
      .field('name', 'form')
      .attach('file', imagePath)
      .expect(200)
      .then(async response => {
        assert(response.body.files.length === 1);
        assert(response.body.files[0].filename === '1.jpg');
        assert(response.body.fields.name === 'form');
        const file1Stat = statSync(response.body.files[0].data);
        assert(file1Stat.size && file1Stat.size === stat.size);
      });

  });

  it('upload file mode not match', async () => {
    const imagePath = join(__dirname, 'fixtures/1.jpg');
    const request = await createHttpRequest(app);
    await request.post('/xxxx')
      .field('name', 'form')
      .attach('file', imagePath)
      .expect(200)
      .then(async response => {
        assert(response.body.ignore);
        assert(!response.body.files);
        assert(!response.body.fields);
      });
  });

  it('upload file mode and auto clean', async () => {
    const imagePath = join(__dirname, 'fixtures/1.jpg');
    const request = await createHttpRequest(app);
    await request.post('/uploadAutoClean')
      .field('name', 'form')
      .attach('file', imagePath)
      .expect(200)
      .then(async response => {
        assert(response.body.files[0].filename === '1.jpg');
        assert(response.body.files.length === 1);
        assert(response.body.fields.name === 'form');
        assert(!existsSync(response.body.files[0].data));
      });
  });
  it('upload unsupport ext file using file', async () => {
    const testPath = join(__dirname, 'fixtures/1.test');
    const request = await createHttpRequest(app);
    await request.post('/upload')
      .field('name', 'form')
      .attach('file', testPath)
      .expect(400);
  });
});
