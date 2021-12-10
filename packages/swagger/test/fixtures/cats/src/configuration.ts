import { Configuration } from '@midwayjs/decorator';
import * as swagger from '../../../../src';

@Configuration({
  importConfigs: [{
    default: {
      swagger: {
        auth: {authType: 'basic'}
      },
    }
  }],
  imports: [
    swagger
  ]
})
export class ContainerConfiguration {

}
