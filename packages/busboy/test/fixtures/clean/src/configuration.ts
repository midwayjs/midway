import { Configuration, Provide, ServerlessTrigger, ServerlessTriggerType, Inject, Fields, Files, App } from '@midwayjs/core';
import * as faas from '@midwayjs/faas';
import * as upload from '../../../../src';

@Configuration({
  imports: [
    faas,
    upload
  ],
  importConfigs: [
    {
      default: {
        busboy: {
          mode: 'file',
          cleanTimeout: 1,
        },
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

@Provide()
export class HelloHttpService {
  @Inject()
  ctx;

  @ServerlessTrigger(ServerlessTriggerType.HTTP, { path: '/upload', method: 'post'})
  async upload(@Fields() fields, @Files() files: upload.UploadStreamFileInfo[]) {
    return {
      files,
      fields
    }
  }
}

