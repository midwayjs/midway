import { Configuration, Provide, ServerlessTrigger, ServerlessTriggerType, Inject, Fields, Files } from '@midwayjs/decorator';
import * as faas from '@midwayjs/faas';
import * as upload from '../../../../src';
import { Readable } from 'stream';

@Configuration({
  imports: [
    faas,
    upload
  ],
  importConfigs: [
    {
      default: {
        upload: {
          mode: 'file',
        },
      }
    }
  ]
})
export class AutoConfiguration {}

@Provide()
export class HelloHttpService {
  @Inject()
  ctx;

  @ServerlessTrigger(ServerlessTriggerType.HTTP, { path: '/upload', method: 'post'})
  async upload(@Fields() fields, @Files() files: upload.UploadFileInfo<Readable>[]) {
    return {
      files,
      fields
    }
  }

  @ServerlessTrigger(ServerlessTriggerType.HTTP, { path: '/uploadAutoClean', method: 'post'})
  async uploadAutoClean(@Fields() fields, @Files() files: upload.UploadFileInfo<Readable>[]) {
    await this.ctx.cleanupRequestFiles();
    return {
      files,
      fields
    }
  }
}

