import {
  Configuration,
  Provide,
  ServerlessTrigger,
  ServerlessTriggerType,
  Inject,
  Fields,
  Files,
  App
} from '@midwayjs/core';
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
          match: /upload/
        },
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

  @ServerlessTrigger(ServerlessTriggerType.HTTP, { path: '/xxxx', method: 'post'})
  async xxxx(@Fields() fields, @Files() files: upload.UploadStreamFileInfo[]) {
    return {
      ignore: true,
      files,
      fields
    }
  }

  @ServerlessTrigger(ServerlessTriggerType.HTTP, { path: '/uploadAutoClean', method: 'post'})
  async uploadAutoClean(@Fields() fields, @Files() files: upload.UploadStreamFileInfo[]) {
    await this.ctx.cleanupRequestFiles();
    return {
      files,
      fields
    }
  }
}

