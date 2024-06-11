import { createHttpRequest, createLightApp, close } from '@midwayjs/mock';
import * as koa from '@midwayjs/koa';
import { join } from 'path';
import { createWriteStream, statSync } from 'fs';
import * as assert from 'assert';
import { Controller, Post } from '@midwayjs/core';
import { tmpdir } from 'os';
import { UploadMiddleware, UploadStreamFileInfo } from '../src';

describe('/test/index.test.ts', () => {
  it('should fix #3858 ', async () => {

    @Controller()
    class APIController {
      @Post('/upload', { middleware: [UploadMiddleware]})
      async upload(ctx) {
        const files = ctx.files as UploadStreamFileInfo;
        const fields = ctx.fields;
        const fileName = join(tmpdir(), Date.now() + '_' + files[0].filename);
        const fsWriteStream = createWriteStream(fileName);

        await new Promise(resolve => {
          fsWriteStream.on('close', resolve);
          files[0].data.pipe(fsWriteStream);
        });

        const stat = statSync(fileName);
        return {
          size: stat.size,
          files,
          fields
        }
      }
    }

    const app = await createLightApp({
      imports: [
        koa,
        require('../src')
      ],
      globalConfig: {
        keys: '123',
        busboy: {
          mode: 'stream',
          whitelist: ['.txt'],
        }
      },
      preloadModules: [
        APIController
      ]
    });

    const filePath = join(__dirname, 'resource/default.txt');
    const request = await createHttpRequest(app);
    await request.post('/upload')
      .field('name', 'form')
      .attach('file', filePath)
      .expect(200)
      .then(async response => {
        const stat = statSync(filePath);
        assert(response.body.size === stat.size);
        assert(response.body.files.length === 1);
        assert(response.body.files[0].filename === 'default.txt');
        assert(response.body.fields.name === 'form');
      });

    await close(app);
  });
});
