import { createHttpRequest, close, createFunctionApp } from '@midwayjs/mock';
import { join } from 'path';
import * as assert from 'assert';
import { existsSync, statSync } from 'fs';
import { sleep } from '@midwayjs/core';

describe('test/clan.test.ts', function () {

  it('upload file auto clean', async () => {
    const appDir = join(__dirname, 'fixtures/clean');
    const imagePath = join(__dirname, 'fixtures/1.jpg');
    const app = await createFunctionApp(appDir, {});
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
        await sleep(2000);
        const exists = existsSync(response.body.files[0].data);
        assert.ok(!exists);
      });
    await close(app);
  });
});
