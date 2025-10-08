import { createHttpRequest, createLightApp, close } from '@midwayjs/mock';
import * as koa from '@midwayjs/koa';
import { join } from 'path';
import { writeFileSync, unlinkSync, existsSync } from 'fs';
import * as assert from 'assert';
import { Controller, Post } from '@midwayjs/core';
import { tmpdir } from 'os';

describe('/test/index.test.ts', () => {
  it('should handle filename with = character correctly', async () => {
    @Controller()
    class APIController {
      @Post('/upload')
      async upload(ctx) {
        const files = ctx.files || [];
        const fields = ctx.fields || {};

        return {
          files: files.map(file => ({
            filename: file.filename,
            fieldName: file.fieldName,
            mimeType: file.mimeType,
            size: file.data.length
          })),
          fields
        };
      }
    }

    const app = await createLightApp({
      imports: [
        koa,
        require('../src')
      ],
      globalConfig: {
        keys: '123',
        upload: {
          mode: 'file',
          whitelist: ['.txt'],
        }
      },
      preloadModules: [
        APIController
      ]
    });

    // Create a test file with = in filename
    const testContent = 'test content for upload';
    const originalFilename = 'test=file.txt';
    const tempFilePath = join(tmpdir(), originalFilename);

    try {
      writeFileSync(tempFilePath, testContent);

      const request = await createHttpRequest(app);

      await request.post('/upload')
        .field('name', 'form')
        .attach('file', tempFilePath)
        .expect(200)
        .then(response => {
          assert(response.body.files.length === 1);
          assert(response.body.files[0].filename === originalFilename);
          assert(response.body.fields.name === 'form');
          assert(response.body.files[0].size > 0);
        });
    } finally {
      // Clean up
      if (existsSync(tempFilePath)) {
        unlinkSync(tempFilePath);
      }
    }

    await close(app);
  });

  it('should handle multiple special characters in filename', async () => {
    @Controller()
    class APIController {
      @Post('/upload')
      async upload(ctx) {
        const files = ctx.files || [];
        const fields = ctx.fields || {};

        return {
          files: files.map(file => ({
            filename: file.filename,
            fieldName: file.fieldName,
            mimeType: file.mimeType,
            size: file.data.length
          })),
          fields
        };
      }
    }

    const app = await createLightApp({
      imports: [
        koa,
        require('../src')
      ],
      globalConfig: {
        keys: '123',
        upload: {
          mode: 'file',
          whitelist: ['.txt'],
        }
      },
      preloadModules: [
        APIController
      ]
    });

    // Create a test file with multiple = characters in filename
    const testContent = 'test content for upload';
    const originalFilename = 'test=file=name=special.txt';
    const tempFilePath = join(tmpdir(), originalFilename);

    try {
      writeFileSync(tempFilePath, testContent);

      const request = await createHttpRequest(app);

      await request.post('/upload')
        .field('name', 'form')
        .attach('file', tempFilePath)
        .expect(200)
        .then(response => {
          assert(response.body.files.length === 1);
          assert(response.body.files[0].filename === originalFilename);
          assert(response.body.fields.name === 'form');
          assert(response.body.files[0].size > 0);
        });
    } finally {
      // Clean up
      if (existsSync(tempFilePath)) {
        unlinkSync(tempFilePath);
      }
    }

    await close(app);
  });
});