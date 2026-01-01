import { MainApp, Configuration, Controller, Fields, Files, Inject, Post } from '@midwayjs/core';
import * as koa from '@midwayjs/koa';
import { UploadFileInfo, uploadWhiteList } from '../../../../src';
import { statSync } from 'fs';
import * as upload from '../../../../src';
import * as validation from '@midwayjs/validation';
import zod from '@midwayjs/validation-zod';
import { Rule } from '@midwayjs/validation';
import { z } from 'zod';

// 定义上传 DTO
class UploadDTO {
  @Rule(z.string().min(1, '名称不能为空'))
  name: string;

  @Rule(z.string().min(1, '名称2不能为空'))
  name2: string;
}

@Configuration({
  imports: [
    koa,
    validation,
    require('../../../../src')
  ],
  importConfigs: [
    {
      default: {
        keys: ["test"],
        busboy: {
          mode: 'file',
          whitelist: uploadWhiteList
        },
        validation: {
          validators: {
            zod,
          },
          defaultValidator: 'zod'
        },
        midwayLogger: {
          clients: {
            appLogger: {
              level: 'debug',
            }
          }
        }
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


@Controller('/')
export class HomeController {

  @Inject()
  ctx;

  @Post('/upload')
  async upload(@Fields() fields: UploadDTO, @Files() files: UploadFileInfo[]) {
    const stat = statSync(files[0].data);

    return {
      size: stat.size,
      files,
      fields
    }
  }
}

