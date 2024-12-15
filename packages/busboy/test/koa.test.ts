import { createHttpRequest, close, createLegacyApp, createLightApp } from "@midwayjs/mock";
import { join } from 'path';
import { createWriteStream, existsSync, statSync } from "fs";
import * as koa from '@midwayjs/koa';
import * as busboy from '../src';
import { Controller, createMiddleware, Fields, Files, Post, File } from "@midwayjs/core";
import { ensureDir, removeSync } from "fs-extra";
import * as assert from 'assert';
import { tmpdir } from "os";
import { randomUUID } from "node:crypto";

describe('test/koa.test.ts', function () {

  describe('koa stream', function () {
    let app;
    beforeAll(async () => {
      const appDir = join(__dirname, 'fixtures/koa-stream');
      app = await createLegacyApp(appDir);
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
      expect(response.body.size).toBe(stat.size);
      expect(response.body.files.length).toBe(1);
      expect(response.body.files[0].filename).toBe('test.pdf');
      expect(response.body.fields.name).toBe('form');
      expect(response.body.fields.name2).toBe('form2');
      expect(response.body.fieldName).toBe('file123');
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
          expect(response.body.size).toBe(stat.size);
          expect(response.body.files.length).toBe(1);
          expect(response.body.files[0].filename).toBe('3kb.png');
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
      app = await createLegacyApp(appDir);
    });

    afterAll(async () => {
      await close(app);
    });

    it('upload file mode', async () => {
      const pdfPath = join(__dirname, 'fixtures/test.pdf');
      const request = createHttpRequest(app);
      const response = await request.post('/upload')
        .field('name', 'form')
        .field('name2', 'form2')
        .attach('file', pdfPath)
        .attach('file2', pdfPath)
        .expect(200);

      expect(response.body.files.length).toBe(2);
      expect(response.body.files[0].fieldName).toBe('file');
      expect(response.body.files[1].fieldName).toBe('file2');
      expect(response.body.files[1].mimeType).toBe('application/pdf');
      expect(response.body.fields.name).toBe('form');
      expect(response.body.fields.name2).toBe('form2');
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
          expect(response.body.size).toBe(stat.size);
          expect(response.body.files[0].data.endsWith('.tar.gz')).toBe(true);
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
      app = await createLegacyApp(appDir);
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
      const app = await createLegacyApp(appDir);
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
      app = await createLegacyApp(appDir);
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
          expect(response.body.files.length).toBe(1);
          expect(response.body.files[0].filename).toBe('test.pdf');
          expect(response.body.fields.name).toBe('form');
          expect(response.body.fields.name2).toBe('form2');
        });
    });
  });

  describe('koa iterator', () => {

    let resourceDir: string;

    beforeEach(() => {
      resourceDir = join(tmpdir(), randomUUID());
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
          for await (const { data, fieldName, filename } of fileIterator) {
            const path = join(resourceDir, `${fieldName}.pdf`);
            const stream = createWriteStream(path);
            const end = new Promise(resolve => {
              stream.on('close', () => {
                resolve(void 0)
              });
            });

            data.pipe(stream);
            await end;

            files.push({
              fieldName,
              filename,
            });
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
        ],
        preloadModules: [HomeController],
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
        ],
        preloadModules: [HomeController],
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
        @Post("/upload-multi", {
          middleware: [createMiddleware(busboy.UploadMiddleware, {
            mode: "asyncIterator",
            limits: {
              fileSize: 1
            }
          })]
        })
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
        ],
        preloadModules: [HomeController],
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
        @Post("/upload-multi", {
          middleware: [createMiddleware(busboy.UploadMiddleware, {
            mode: "asyncIterator",
            limits: {
              fileSize: 1
            }
          })]
        })
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
          return 'ok';
        }
      }
      const app = await createLightApp({
        imports: [
          koa,
          busboy,
        ],
        preloadModules: [HomeController],
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
      await close(app);
    });

    it.skip("should got 204 when iterator not use", async () => {
      @Controller("/")
      class HomeController {
        @Post("/upload-multi", {
          middleware: [createMiddleware(busboy.UploadMiddleware, {
            mode: "asyncIterator",
            limits: {}
          })]
        })
        async uploadMore(@Files() fileIterator: AsyncGenerator<busboy.UploadStreamFileInfo>) {
          // 这里如果不处理迭代器，会出现 unhandled error
        }
      }

      const app = await createLightApp({
        imports: [
          koa,
          busboy,
          HomeController
        ],
        globalConfig: {
          keys: "123",
          busboy: {}
        }
      });

      const txtPath = join(__dirname, "fixtures/1.test");
      const request = createHttpRequest(app);
      const response = await request.post("/upload-multi")
        .attach("file", txtPath);

      expect(response.status).toBe(204);
      await close(app);
    });

    it("should check type", async () => {
      @Controller("/")
      class HomeController {
        @Post("/upload-multi", {
          middleware: [createMiddleware(busboy.UploadMiddleware, {
            mode: "asyncIterator",
            limits: {}
          })]
        })
        async uploadMore(@Files() fileIterator: AsyncGenerator<busboy.UploadStreamFileInfo>) {
          const files = [];
          for await (const file of fileIterator) {
            const path = join(resourceDir, `${file.fieldName}.pdf`);
            const stream = createWriteStream(path);
            const end = new Promise(resolve => {
              stream.on("close", () => {
                resolve(void 0);
              });
            });

            file.data.pipe(stream);
            await end;
            files.push(file);
          }
        }
      }

      const app = await createLightApp({
        imports: [
          koa,
          busboy,
        ],
        preloadModules: [HomeController],
        globalConfig: {
          keys: "123",
          busboy: {}
        }
      });

      const txtPath = join(__dirname, 'fixtures/1.test');
      const request = createHttpRequest(app);
      const response = await request.post('/upload-multi')
        .attach('file', txtPath);

      expect(response.status).toBe(400);
      await close(app);
    });

    it("should check size of result", async () => {
      @Controller("/")
      class HomeController {
        @Post("/upload", {
          middleware: [createMiddleware(busboy.UploadMiddleware, {
            mode: "file"
          })]
        })
        async uploadFile(@File() file) {
          return statSync(file.data).size;
        }

        @Post("/upload-multi", {
          middleware: [createMiddleware(busboy.UploadMiddleware, {
            mode: "asyncIterator"
          })]
        })
        async uploadMore(@Files() fileIterator: AsyncGenerator<busboy.UploadStreamFileInfo>) {
          const files = [];
          for await (const file of fileIterator) {
            const path = join(resourceDir, `${file.fieldName}.pdf`);
            const stream = createWriteStream(path);
            const end = new Promise(resolve => {
              stream.on("close", () => {
                resolve(void 0);
              });
            });

            file.data.pipe(stream);
            await end;
            files.push(statSync(path).size);
          }

          return files[0];
        }
      }
      const app = await createLightApp({
        imports: [
          koa,
          busboy,
        ],
        preloadModules: [HomeController],
        globalConfig: {
          keys: '123',
          busboy: {
            whitelist: ['.test']
          }
        },
      });

      const txtPath = join(__dirname, 'fixtures/1.test');
      const request = createHttpRequest(app);
      const response = await request.post('/upload-multi')
        .attach('file', txtPath);

      expect(response.status).toBe(200);
      expect(response.body).toBe(6);
      await close(app);
    });
  });
});
