import { Configuration, Provide, ServerlessTrigger, ServerlessTriggerType, Inject } from '@midwayjs/decorator';
import * as faas from '@midwayjs/faas';

@Configuration({
  imports: [
    faas,
    require('../../../../src')
  ],
  importConfigs: [
    {
      default: {
        upload: {
          mode: 'file',
        },
      }
    }
  ]
})
export class AutoConfiguration {}

@Provide()
export class HelloHttpService {
  @Inject()
  ctx;

  @ServerlessTrigger(ServerlessTriggerType.HTTP, { path: '/upload', method: 'post'})
  async upload() {
    const { files, fields } = this.ctx;
    return {
      files,
      fields
    }
  }
}

