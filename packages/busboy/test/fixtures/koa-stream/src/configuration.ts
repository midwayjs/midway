import { Configuration, Controller, Fields, Inject, Post, File, Get, App } from '@midwayjs/core';
import * as koa from '@midwayjs/koa';
import { createWriteStream, statSync } from 'fs'
import { join } from 'path';
import * as upload from '../../../../src';

@Configuration({
  imports: [
    koa,
    upload
  ],
  importConfigs: [
    {
      default: {
        keys: ["test"],
        busboy: {
          mode: 'stream',
        }
      }
    }
  ]
})
export class AutoConfiguration {
  @App()
  app;
  async onReady() {
    this.app.useMiddleware(upload.UploadMiddleware);
  }
}


@Controller('/')
export class HomeController {

  @Inject()
  ctx;

  @Get('/')
  async home() {
    return 'home'
  }
  @Post('/upload')
  async upload(@File() file: upload.UploadStreamFileInfo, @Fields() fields) {
    const path = join(__dirname, '../logs/test.pdf');
    const stream = createWriteStream(path);
    const end = new Promise(resolve => {
      stream.on('close', () => {
        resolve(void 0)
      });
    });
    file.data.pipe(stream);
    await end;
    const stat = statSync(path);
    return {
      size: stat.size,
      files: [file],
      fields
    }
  }
}

