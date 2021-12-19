import { Configuration, Inject } from '@midwayjs/decorator';
import { join } from 'path';
import { Framework } from '../../../../src';
import { TestMiddleware } from './middleware/test';

@Configuration({
  importConfigs: [
    join(__dirname, './config'),
  ],
  imports: [
    require('../../../../src')
  ],
})
export class ContainerConfiguration {

  @Inject()
  framework: Framework;

  async onReady() {
    this.framework.useMiddleware(TestMiddleware);
  }
}
