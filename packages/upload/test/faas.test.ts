import { createApp, createHttpRequest, close } from '@midwayjs/mock';
import { join } from 'path';
import * as assert from 'assert';

describe('test/faas.test.ts', function () {

  it('upload file', async (done) => {
    const appDir = join(__dirname, 'fixtures/faas');
    const app = await createApp(appDir);
    const imagePath = join(appDir, '1.jpg');
    const request = createHttpRequest(app);
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
