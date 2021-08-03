import { Configuration } from '@midwayjs/decorator';
import { join } from 'path';
import * as mongoose from 'mongoose';

@Configuration({
  namespace: 'mongoose',
  importConfigs: [join(__dirname, 'config')],
})
export class AutoConfiguration {
  async onReady(app) {
    await app.getAsync('mongoose:mongooseService');
  }

  async onStop() {
    await mongoose.disconnect();
  }
}
