import { Configuration, Controller, Fields, Files, Inject, Post } from '@midwayjs/decorator';
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
  async upload(@Fields() fields, @Files() files: upload.UploadFileInfo<string>[]) {
    return {
      files,
      fields
    }
  }
}

