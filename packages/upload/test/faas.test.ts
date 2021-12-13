import { createHttpRequest, close, createFunctionApp } from '@midwayjs/mock';
import { join } from 'path';
import * as assert from 'assert';
import * as ServerlessApp from '../../../packages-serverless/serverless-app/src';

describe('test/faas.test.ts', function () {

  it('upload file mode', async () => {
    const appDir = join(__dirname, 'fixtures/faas');
    const app = await createFunctionApp<ServerlessApp.Framework>(appDir, {}, ServerlessApp);
    const imagePath = join(appDir, '1.jpg');
    const request = await createHttpRequest(app);
    await request.post('/upload')
      .field('name', 'form')
      .attach('file', imagePath)
      .expect(200)
      .then(async response => {
        assert(response.body.files.length === 1);
        assert(response.body.files[0].filename === '1.jpg');
        assert(response.body.fields.name === 'form');
      });
    await close(app);
  });
});
