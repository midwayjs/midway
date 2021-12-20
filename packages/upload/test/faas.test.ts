import { createHttpRequest, close, createFunctionApp } from '@midwayjs/mock';
import { join } from 'path';
import * as assert from 'assert';
import * as ServerlessApp from '../../../packages-serverless/serverless-app/src';
import { statSync } from 'fs';

describe('test/faas.test.ts', function () {

  it('upload file mode', async () => {
    const appDir = join(__dirname, 'fixtures/faas');
    const imagePath = join(__dirname, 'fixtures/1.jpg');
    const app = await createFunctionApp<ServerlessApp.Framework>(appDir, {}, ServerlessApp);
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
    await close(app);
  });
  it('upload unsupport ext file using file', async () => {

    const appDir = join(__dirname, 'fixtures/faas');
    const testPath = join(__dirname, 'fixtures/1.test');
    const app = await createFunctionApp<ServerlessApp.Framework>(appDir, {}, ServerlessApp);
    const request = await createHttpRequest(app);
    await request.post('/upload')
      .field('name', 'form')
      .attach('file', testPath)
      .expect(400);
    await close(app);
  });
});
