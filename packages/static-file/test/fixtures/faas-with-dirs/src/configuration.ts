import {
  Configuration,
  Inject,
  Provide,
  ServerlessTrigger,
  ServerlessTriggerType
} from '@midwayjs/decorator';
import { join } from 'path';
import * as faas from '@midwayjs/faas';

@Configuration({
  imports: [
    faas,
    require('../../../../src')
  ],
  importConfigs: [
    join(__dirname, './config.default'),
  ]
})
export class AutoConfiguration {

}

@Provide()
export class HelloHttpService {
  @Inject()
  ctx;

  @ServerlessTrigger(ServerlessTriggerType.HTTP, { path: '/*', method: 'get'})
  async upload() {
    return 'bbb';
  }

}

