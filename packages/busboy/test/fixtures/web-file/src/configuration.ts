import { MainApp, Configuration, Controller, Fields, Files, Inject, Post } from '@midwayjs/core';
import * as web from '@midwayjs/web';
import * as defaultConfig from './config/config.default';
import * as upload from '../../../../src';
import { UploadFileInfo } from '../../../../src';
@Configuration({
  imports: [
    web,
    upload
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
  async upload(@Fields() fields, @Files() files: UploadFileInfo[]) {
    return {
      files,
      fields
    }
  }
}

