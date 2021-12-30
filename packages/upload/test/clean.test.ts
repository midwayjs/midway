import { createHttpRequest, close, createFunctionApp } from '@midwayjs/mock';
import { join } from 'path';
import * as assert from 'assert';
import * as ServerlessApp from '../../../packages-serverless/serverless-app/src';
import { existsSync, statSync } from 'fs';
import { sleep } from '@midwayjs/decorator';

describe('test/clan.test.ts', function () {

  it('upload file auto clean', async () => {
    const appDir = join(__dirname, 'fixtures/clean');
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
        await sleep(2000);
        const exists = existsSync(response.body.files[0].data);
        assert(!exists);
      });
    await close(app);
  });
});
