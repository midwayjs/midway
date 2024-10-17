import { Configuration, Controller, Fields, Inject, Post, Get, App, Files } from "@midwayjs/core";
import * as koa from '@midwayjs/koa';
import { createWriteStream, statSync } from 'fs'
import { join } from 'path';
import * as upload from '../../../../src';

@Configuration({
  imports: [
    koa,
    upload
  ],
  importConfigs: [
    {
      default: {
        keys: ["test"],
        busboy: {
          mode: 'stream',
        }
      }
    }
  ]
})
export class AutoConfiguration {
  @App()
  app;
  async onReady() {
    this.app.useMiddleware(upload.UploadMiddleware);
  }
}


@Controller('/')
export class HomeController {

  @Inject()
  ctx;

  @Get('/')
  async home() {
    return 'home'
  }
  @Post('/upload')
  async upload(@Files() files: Array<upload.UploadStreamFileInfo>, @Fields() fields) {
    for(let file of files) {
      const path = join(__dirname, `../logs/${file.fieldName}.pdf`);
      const stream = createWriteStream(path);
      const end = new Promise(resolve => {
        stream.on('close', () => {
          resolve(void 0)
        });
      });

      file.data.pipe(stream);
      await end;
    }

    const stat = statSync(join(__dirname, `../logs/${files[0].fieldName}.pdf`));
    return {
      size: stat.size,
      files,
      fields,
      fieldName: files[0].fieldName,
    }
  }
}

