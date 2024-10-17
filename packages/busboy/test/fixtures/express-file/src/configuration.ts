import { App, Configuration, Controller, Fields, Files, Inject, Post } from '@midwayjs/core';
import * as express from '@midwayjs/express';
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
          mode: 'file',
          ignore: /ignore/,
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

  @Post('/upload')
  async upload(@Fields() fields, @Files() files: upload.UploadFileInfo[]) {
    return {
      files,
      fields
    }
  }

  @Post('/upload-ignore')
  async uploadIgnore(@Fields() fields, @Files() files: upload.UploadFileInfo[]) {
    return {
      files,
      fields,
      ignore: true
    }
  }
}

