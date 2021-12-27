import { Configuration, Controller, Fields, Files, Inject, Post } from '@midwayjs/decorator';
import * as koa from '@midwayjs/koa';
import { UploadFileInfo } from '../../../../src';
import { Readable } from 'stream';

@Configuration({
  imports: [
    koa,
    require('../../../../src')
  ],
  importConfigs: [
    {
      default: {
        keys: ["test"],
        upload: {
          mode: 'file',
        }
      }
    }
  ]
})
export class AutoConfiguration {}


@Controller('/')
export class HomeController {

  @Inject()
  ctx;

  @Post('/upload')
  async upload(@Fields() fields, @Files() files: UploadFileInfo<Readable>[]) {
    return {
      files,
      fields
    }
  }
}
