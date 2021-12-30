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
          cleanTimeout: 1,
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
}

