import { createHttpRequest, close, createFunctionApp } from '@midwayjs/mock';
import { join } from 'path';
import { existsSync, statSync } from 'fs';
import { sleep } from '@midwayjs/core';
import { Framework } from '@midwayjs/faas';

describe('test/clean.test.ts', function () {

  it('upload file auto clean', async () => {
    const appDir = join(__dirname, 'fixtures/clean');
    const imagePath = join(__dirname, 'fixtures/1.jpg');
    const app = await createFunctionApp<Framework>(appDir, {});
    const request = await createHttpRequest(app);
    const stat = statSync(imagePath);
    const response = await request.post('/upload')
      .field('name', 'form')
      .attach('file', imagePath);

    expect(response.status).toBe(200);
    expect(response.body.files.length).toBe(1);
    expect(response.body.files[0].filename).toBe('1.jpg');
    expect(response.body.fields.name).toBe('form');
    const file1Stat = statSync(response.body.files[0].data);
    expect(file1Stat.size).toBe(stat.size);

    await sleep(5000);

    const exists = existsSync(response.body.files[0].data);
    expect(exists).toBe(false);
    await close(app);
  });
});
