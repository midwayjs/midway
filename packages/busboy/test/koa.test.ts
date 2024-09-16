import { createHttpRequest, close, createApp, createLightApp } from "@midwayjs/mock";
import { join } from 'path';
import * as assert from 'assert';
import { createWriteStream, existsSync, statSync } from "fs";
import * as koa from '@midwayjs/koa';
import * as busboy from '../src';
import { Controller, createMiddleware, Fields, Files, Post, File } from "@midwayjs/core";
import { ensureDir, removeSync } from "fs-extra";

describe('test/koa.test.ts', function () {

  describe('koa stream', function () {
    let app;
    beforeAll(async () => {
      const appDir = join(__dirname, 'fixtures/koa-stream');
      app = await createApp(appDir);
    });

    afterAll(async () => {
      await close(app);
    });
    it('upload stream mode', async () => {
      const pdfPath = join(__dirname, 'fixtures/test.pdf');
      const request = createHttpRequest(app);
      const response = await request.post('/upload')
        .field('name', 'form')
        .field('name2', 'form2')
        .attach('file123', pdfPath)
        .expect(200);

      const stat = statSync(pdfPath);
      assert(response.body.size === stat.size);
      assert(response.body.files.length === 1);
      assert(response.body.files[0].filename === 'test.pdf');
      assert(response.body.fields.name === 'form');
      assert(response.body.fields.name2 === 'form2');
      assert(response.body.fieldName === 'file123');
    });

    it('upload stream mode 3kb', async () => {
      // fix: issue#2309
      // 实际上 supertest 无法模拟出来效果
      const pdfPath = join(__dirname, 'fixtures/3kb.png');
      const request = createHttpRequest(app);
      await request.post('/upload')
        .attach('file', pdfPath)
        .field('name', 'form')
        .expect(200)
        .then(async response => {
          const stat = statSync(pdfPath);
          assert(response.body.size === stat.size);
          assert(response.body.files.length === 1);
          assert(response.body.files[0].filename === '3kb.png');
        });
    });

    it('upload unsupport ext file using stream', async () => {
      const filePath = join(__dirname, 'fixtures/1.test');
      const request = createHttpRequest(app);
      await request.post('/upload')
        .field('name', 'form')
        .field('name2', 'form2')
        .attach('file', filePath)
        .expect(400);
    });
  });

  describe('koa file', function () {
    let app;
    beforeAll(async () => {
      const appDir = join(__dirname, 'fixtures/koa-file');
      app = await createApp(appDir);
    });

    afterAll(async () => {
      await close(app);
    });

    it('upload file mode', async () => {
      const pdfPath = join(__dirname, 'fixtures/test.pdf');
      const request = createHttpRequest(app);
      await request.post('/upload')
        .field('name', 'form')
        .field('name2', 'form2')
        .attach('file', pdfPath)
        .attach('file2', pdfPath)
        .expect(200)
        .then(async response => {
          assert(response.body.files.length === 2);
          // assert(response.body.files[0].fieldName === 'file');
          // assert(response.body.files[1].fieldName === 'file2');
          assert(response.body.files[1].mimeType === 'application/pdf');
          assert(response.body.fields.name === 'form');
          assert(response.body.fields.name2 === 'form2');
        });
    });

    it('upload file type .tar.gz', async () => {
      const path = join(__dirname, 'fixtures/1.tar.gz');
      const request = createHttpRequest(app);
      await request.post('/upload')
        .field('name', 'form')
        .field('name2', 'form2')
        .attach('file', path)
        .expect(200)
        .then(async response => {
          const stat = statSync(path);
          assert(response.body.size === stat.size);
          assert(response.body.files[0].data.endsWith('.tar.gz'));
        });
    });

    it('upload unsupported ext file using file', async () => {
      const filePath = join(__dirname, 'fixtures/1.test');
      const request = createHttpRequest(app);
      await request.post('/upload')
        .field('name', 'form')
        .field('name2', 'form2')
        .attach('file', filePath)
        .expect(400);
    });

  });

  describe('koa file mime', function () {
    let app;
    beforeAll(async () => {
      const appDir = join(__dirname, 'fixtures/koa-file-mime');
      app = await createApp(appDir);
    });

    afterAll(async () => {
      await close(app);
    });

    it('invalid file type', async () => {
      const filePath = join(__dirname, 'fixtures/err.jpg');
      const request = createHttpRequest(app);
      await request.post('/upload')
        .field('name', 'form')
        .field('name2', 'form2')
        .attach('file', filePath)
        .expect(400);
    });

    it('invalid file type 2', async () => {
      const filePath = join(__dirname, 'fixtures/1.from-jpg.png');
      const request = createHttpRequest(app);
      await request.post('/upload')
        .field('name', 'form')
        .field('name2', 'form2')
        .attach('file', filePath)
        .expect(400);
    });

    it('normal file type', async () => {
      const filePath = join(__dirname, 'fixtures/1.jpg');
      const request = createHttpRequest(app);
      await request.post('/upload')
        .field('name', 'form')
        .field('name2', 'form2')
        .attach('file', filePath)
        .expect(200);
    });

    it('normal file type 2', async () => {
      const filePath = join(__dirname, 'fixtures/1.more');
      const request = createHttpRequest(app);
      await request.post('/upload')
        .field('name', 'form')
        .field('name2', 'form2')
        .attach('file', filePath)
        .expect(200);
    });
  });

  describe('test null set', function () {
    it('upload test ext set null', async () => {
      const appDir = join(__dirname, 'fixtures/koa-ext-null');
      const app = await createApp(appDir);
      const filePath = join(__dirname, 'fixtures/1.test');
      const request = createHttpRequest(app);
      await request.post('/upload')
        .field('name', 'form')
        .field('name2', 'form2')
        .attach('file', filePath)
        .expect(200);

      await close(app);
    });
  });

  describe('koa function whitelist and mimeTypeWhiteList', function () {
    let app;
    beforeAll(async () => {
      const appDir = join(__dirname, 'fixtures/koa-function-whitelist');
      app = await createApp(appDir);
    });

    afterAll(async () => {
      await close(app);
    });

    it('upload with function whitelist and mimeTypeWhiteList', async () => {
      const filePath = join(__dirname, 'fixtures/test.pdf');
      const request = createHttpRequest(app);
      await request.post('/upload')
        .field('name', 'form')
        .field('name2', 'form2')
        .attach('file', filePath)
        .expect(200)
        .then(async response => {
          assert(response.body.files.length === 1);
          assert(response.body.files[0].filename === 'test.pdf');
          assert(response.body.fields.name === 'form');
          assert(response.body.fields.name2 === 'form2');
        });
    });
  });

  describe('koa iterator', () => {

    const resourceDir = join(__dirname, 'tmp');

    beforeEach(() => {
      if (existsSync(resourceDir)) {
        removeSync(resourceDir);
      }
      ensureDir(resourceDir);
    })

    it('upload stream mode and multi file', async () => {
      @Controller('/')
      class HomeController {
        @Post('/upload-multi', { middleware: [ createMiddleware(busboy.UploadMiddleware, { mode: 'asyncIterator' }) ] })
        async uploadMore(
          @Files() fileIterator: AsyncGenerator<busboy.UploadStreamFileInfo>,
          @Fields() fieldIterator: AsyncGenerator<busboy.UploadStreamFieldInfo>,
          @File() singleFileIterator: AsyncGenerator<busboy.UploadStreamFileInfo>)
        {
          assert(singleFileIterator === fileIterator);
          const files = [], fields = [];
          for await (const file of fileIterator) {
            const path = join(resourceDir, `${file.fieldName}.pdf`);
            const stream = createWriteStream(path);
            const end = new Promise(resolve => {
              stream.on('close', () => {
                resolve(void 0)
              });
            });

            file.data.pipe(stream);
            await end;

            files.push(file);
          }

          for await (const field of fieldIterator) {
            fields.push(field);
          }

          const stat = statSync(join(resourceDir, `${files[0].fieldName}.pdf`));
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
          busboy,
          HomeController
        ],
        globalConfig: {
          keys: '123',
          busboy: {}
        },
      });

      const pdfPath = join(__dirname, 'fixtures/test.pdf');
      const request = createHttpRequest(app);
      const response = await request.post('/upload-multi')
        .field('name', 'form')
        .field('name2', 'form2')
        .attach('file123', pdfPath)
        .attach('file2', pdfPath)
        .expect(200);

      const stat = statSync(pdfPath);
      expect(response.body.size).toBe(stat.size);
      expect(response.body.files.length).toBe(2);
      expect(response.body.files[0].filename).toBe('test.pdf');
      expect(response.body.files[0].fieldName).toBe('file123');
      expect(response.body.files[1].filename).toBe('test.pdf');
      expect(response.body.files[1].fieldName).toBe('file2');
      expect(response.body.fields[0].value).toBe('form');
      expect(response.body.fields[1].value).toBe('form2');

      await close(app);
    });

    it('upload stream mode and multi file with read fields', async () => {
      @Controller('/')
      class HomeController {
        @Post('/upload-multi', { middleware: [ createMiddleware(busboy.UploadMiddleware, { mode: 'asyncIterator' }) ] })
        async uploadMore(@Files() fileIterator: AsyncGenerator<busboy.UploadStreamFileInfo>) {
          const files = [];
          for await (const file of fileIterator) {
            const path = join(resourceDir, `${file.fieldName}.pdf`);
            const stream = createWriteStream(path);
            const end = new Promise(resolve => {
              stream.on('close', () => {
                resolve(void 0)
              });
            });

            file.data.pipe(stream);
            await end;

            files.push(file);
          }

          const stat = statSync(join(resourceDir, `${files[0].fieldName}.pdf`));
          return {
            size: stat.size,
            files,
          }
        }
      }
      const app = await createLightApp({
        imports: [
          koa,
          busboy,
          HomeController
        ],
        globalConfig: {
          keys: '123',
          busboy: {}
        },
      });

      const pdfPath = join(__dirname, 'fixtures/test.pdf');
      const request = createHttpRequest(app);
      const response = await request.post('/upload-multi')
        .field('name', 'form')
        .field('name2', 'form2')
        .attach('file123', pdfPath)
        .attach('file2', pdfPath)
        .expect(200);

      const stat = statSync(pdfPath);
      expect(response.body.size).toBe(stat.size);
      expect(response.body.files.length).toBe(2);
      expect(response.body.files[0].filename).toBe('test.pdf');
      expect(response.body.files[0].fieldName).toBe('file123');
      expect(response.body.files[1].filename).toBe('test.pdf');
      expect(response.body.files[1].fieldName).toBe('file2');

      await close(app);
    });

    it('upload stream mode and multi file and trigger limit error', async () => {
      @Controller('/')
      class HomeController {
        @Post('/upload-multi', { middleware: [ createMiddleware(busboy.UploadMiddleware, {
          mode: 'asyncIterator',
          limits: {
            fileSize: 1
          }
        }) ] })
        async uploadMore(@Files() fileIterator: AsyncGenerator<busboy.UploadStreamFileInfo>) {
          const files = [];
          for await (const file of fileIterator) {
            const path = join(resourceDir, `${file.fieldName}.pdf`);
            const stream = createWriteStream(path);
            const end = new Promise(resolve => {
              stream.on('close', () => {
                resolve(void 0)
              });
            });

            file.data.pipe(stream);
            await end;
            files.push(file);
          }

          const stat = statSync(join(resourceDir, `${files[0].fieldName}.pdf`));
          return {
            size: stat.size,
            files,
          }
        }
      }
      const app = await createLightApp({
        imports: [
          koa,
          busboy,
          HomeController
        ],
        globalConfig: {
          keys: '123',
          busboy: {}
        },
      });

      const pdfPath = join(__dirname, 'fixtures/test.pdf');
      const request = createHttpRequest(app);
      const response = await request.post('/upload-multi')
        .field('name', 'form')
        .field('name2', 'form2')
        .attach('file123', pdfPath)
        .attach('file2', pdfPath);

      expect(response.status).toBe(400);
      await close(app);
    });

    it('upload stream mode trigger limit error and catch it', async () => {
      @Controller('/')
      class HomeController {
        @Post('/upload-multi', { middleware: [ createMiddleware(busboy.UploadMiddleware, {
            mode: 'asyncIterator',
            limits: {
              fileSize: 1
            }
          }) ] })
        async uploadMore(@Files() fileIterator: AsyncGenerator<busboy.UploadStreamFileInfo>) {
          const files = [];
          try {
            for await (const file of fileIterator) {
              const path = join(resourceDir, `${file.fieldName}.pdf`);
              const stream = createWriteStream(path);
              const end = new Promise(resolve => {
                stream.on('close', () => {
                  resolve(void 0)
                });
              });

              file.data.pipe(stream);
              await end;
              files.push(file);
            }
          } catch (err) {
            console.error(err.message);
          }

          const stat = statSync(join(resourceDir, `${files[0].fieldName}.pdf`));
          return {
            size: stat.size,
            files,
          }
        }
      }
      const app = await createLightApp({
        imports: [
          koa,
          busboy,
          HomeController
        ],
        globalConfig: {
          keys: '123',
          busboy: {}
        },
      });

      const pdfPath = join(__dirname, 'fixtures/test.pdf');
      const request = createHttpRequest(app);
      const response = await request.post('/upload-multi')
        .field('name', 'form')
        .field('name2', 'form2')
        .attach('file123', pdfPath)
        .attach('file2', pdfPath);

      expect(response.status).toBe(200);
      expect(response.body.size).toBe(1);
      await close(app);
    });
  });
});
