import { Configuration, Controller, Fields, Inject, Post, sleep, File } from '@midwayjs/decorator';
import * as koa from '@midwayjs/koa';
import { createWriteStream } from 'fs'
import { join } from 'path';
import * as upload from '../../../../src';
import { Readable } from 'stream';

@Configuration({
  imports: [
    koa,
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
  async upload(@File() file: upload.UploadFileInfo<Readable>, @Fields() fields) {
    const path = join(__dirname, '../logs/test.pdf');
    const stream = createWriteStream(path)
    file.data.pipe(stream);
    await sleep(2000);
    return {
      files: [file],
      fields
    }
  }
}

