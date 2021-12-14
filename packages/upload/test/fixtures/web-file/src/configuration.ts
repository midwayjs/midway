import { Configuration, Controller, Inject, Post } from '@midwayjs/decorator';
import * as web from '@midwayjs/web';
import * as defaultConfig from './config/config.default';
import * as upload from '../../../../src';
@Configuration({
  imports: [
    web,
    upload
  ],
  importConfigs: [
    {
      default: defaultConfig
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

