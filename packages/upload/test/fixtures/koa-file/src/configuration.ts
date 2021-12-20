import { Configuration, Controller, Inject, Post } from '@midwayjs/decorator';
import * as koa from '@midwayjs/koa';

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
  async upload() {
    const { files, fields } = this.ctx;
    return {
      files,
      fields
    }
  }
}

