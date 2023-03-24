import { Configuration, Controller, Fields, Files, Inject, Post } from '@midwayjs/core';
import * as koa from '@midwayjs/koa';
import { UploadFileInfo, uploadWhiteList, uploadFileTypeList } from '../../../../src';
import { statSync } from 'fs';

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
          whitelist: uploadWhiteList.concat('.more'),
          fileTypeWhiteList: uploadFileTypeList.concat([[`.more`, 'image/jpeg', 'image/png']]),
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
  async upload(@Fields() fields, @Files() files: UploadFileInfo<string>[]) {
    const stat = statSync(files[0].data);
    return {
      size: stat.size,
      files,
      fields
    }
  }
}
