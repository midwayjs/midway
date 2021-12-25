import { Configuration, Controller, Fields, Files, Inject, Post, sleep } from '@midwayjs/decorator';
import * as express from '@midwayjs/express';
import { createWriteStream } from 'fs';
import { join } from 'path';
import * as upload from '../../../../src';
import { Readable } from 'stream';

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
          mode: 'stream',
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
  async upload(@Files() files: upload.UploadFileInfo<Readable>, @Fields() fields) {
    const path = join(__dirname, '../logs/test.pdf');
    const stream = createWriteStream(path)
    files[0].data.pipe(stream);
    await sleep(2000);
    files[0].data = path as any;
    return {
      files,
      fields
    }
  }
}

