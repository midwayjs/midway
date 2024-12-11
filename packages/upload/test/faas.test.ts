import { createHttpRequest, close, createLegacyFunctionApp } from '@midwayjs/mock';
import { join } from 'path';
import * as assert from 'assert';
import { existsSync, statSync } from 'fs';

describe('test/faas.test.ts', function () {
  let app;
  beforeAll(async () => {
    const appDir = join(__dirname, 'fixtures/faas');
    app = await createLegacyFunctionApp(appDir, {});
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
        assert.ok(response.body.files.length === 1);
        assert.ok(response.body.files[0].filename === '1.jpg');
        assert.ok(response.body.fields.name === 'form');
        const file1Stat = statSync(response.body.files[0].data);
        assert.ok(file1Stat.size && file1Stat.size === stat.size);
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
        assert.ok(response.body.ignore);
        assert.ok(!response.body.files);
        assert.ok(!response.body.fields);
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
        assert.ok(response.body.files[0].filename === '1.jpg');
        assert.ok(response.body.files.length === 1);
        assert.ok(response.body.fields.name === 'form');
        assert.ok(!existsSync(response.body.files[0].data));
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
