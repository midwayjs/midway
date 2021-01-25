import { Configuration } from '@midwayjs/decorator';
import * as path from 'path'

@Configuration({
  namespace: 'mongoose',
  importConfigs: [path.join(__dirname, "config")]
})
export class AutoConfiguration {

  async onReady(app){
    await app.getAsync('mongoose:mongooseService')
  }
}
