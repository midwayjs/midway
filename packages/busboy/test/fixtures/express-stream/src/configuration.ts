import { MainApp, Configuration, Controller, Fields, Files, Inject, Post, sleep } from '@midwayjs/core';
import * as express from '@midwayjs/express';
import { createWriteStream } from 'fs';
import { join } from 'path';
import * as upload from '../../../../src';

@Configuration({
  imports: [
    express,
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
  @MainApp()
  app;
  async onReady() {
    this.app.useMiddleware(upload.UploadMiddleware);
  }
}


@Controller('/')
export class HomeController {

  @Inject()
  ctx;

  @Post('/upload')
  async upload(@Files() files: upload.UploadStreamFileInfo, @Fields() fields) {
    const path = join(__dirname, '../logs/test.pdf');
    const stream = createWriteStream(path)
    files[0].data.pipe(stream);
    await sleep(2000);
    files[0].data = path as any;
    return {
      files,
      fields
    }
  }
}

