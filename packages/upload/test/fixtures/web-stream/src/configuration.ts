import { Configuration, Controller, Inject, Post, sleep } from '@midwayjs/decorator';
import * as web from '@midwayjs/web';
import { createWriteStream } from 'fs';
import { join } from 'path';
import * as defaultConfig from './config/config.default';

@Configuration({
  imports: [
    web,
    require('../../../../src')
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
    const path = join(__dirname, '../logs/test.pdf');
    const stream = createWriteStream(path)
    files[0].data.pipe(stream);
    await sleep(2000);
    return {
      files,
      fields
    }
  }
}

