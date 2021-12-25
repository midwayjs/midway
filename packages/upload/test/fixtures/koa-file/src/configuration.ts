import { Configuration, Controller, Fields, Files, Inject, Post } from '@midwayjs/decorator';
import * as koa from '@midwayjs/koa';
import { UploadFileInfo } from '../../../../src';

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
  async upload(@Fields() fields, @Files() files: UploadFileInfo[]) {
    return {
      files,
      fields
    }
  }
}
