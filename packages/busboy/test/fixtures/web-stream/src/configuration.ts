import { MainApp, Configuration, Controller, Fields, File, Inject, Post, sleep } from '@midwayjs/core';
import * as web from '@midwayjs/web';
import { createWriteStream } from 'fs';
import { join } from 'path';
import * as defaultConfig from './config/config.default';
import * as upload from '../../../../src';

@Configuration({
  imports: [
    web,
    upload,
  ],
  importConfigs: [
    {
      default: defaultConfig
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
  async upload(@File() file: upload.UploadStreamFileInfo, @Fields() fields) {
    const path = join(__dirname, '../logs/test.pdf');
    const stream = createWriteStream(path)
    file.data.pipe(stream);
    await sleep(2000);
    return {
      files: [file],
      fields
    }
  }
}

