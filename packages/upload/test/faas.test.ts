import { createHttpRequest, close, createFunctionApp } from '@midwayjs/mock';
import { join } from 'path';
import * as assert from 'assert';

describe('test/faas.test.ts', function () {

  it('upload file mode', async (done) => {
    const appDir = join(__dirname, 'fixtures/faas');
    const app = await createFunctionApp(appDir);
    const imagePath = join(appDir, '1.jpg');
    console.log('imagePath', imagePath);
    const request = await createHttpRequest(app);
    console.log('request', request);
    await request.post('/upload')
      .field('name', 'form')
      .attach('file', imagePath)
      .expect(200)
      .then(async response => {
        console.log('response', response.body);
        assert(response.body.files.length === 1);
        assert(response.body.files[0].filename === '1.jpg');
        assert(response.body.fields.name === 'form');
        done();
      })
      .catch(err => done(err));
    await close(app);
  });
});
