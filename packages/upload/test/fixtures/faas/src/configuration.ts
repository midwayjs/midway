import { Configuration, Provide, ServerlessTrigger, ServerlessTriggerType, Inject } from '@midwayjs/decorator';
import * as faas from '../../../../../faas';
import MemoryStore = require('memorystore');

@Configuration({
  imports: [
    faas,
    require('../../../../src')
  ],
  importConfigs: [
    {
      default: {}
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
    console.log('upload function');
    const { files, fields } = this.ctx;
    return {
      files,
      fields
    }
  }
}

