import { Configuration } from '@midwayjs/decorator';
import * as swagger from '../../../../src';

@Configuration({
  importConfigs: [{
    default: {
      swagger: {
        auth: [{authType: 'basic', name: 'bbb'}, {authType: 'bearer', name: 'ttt'}]
      },
    }
  }],
  imports: [
    swagger
  ]
})
export class ContainerConfiguration {

}
