import { Configuration } from '@midwayjs/decorator';
import * as swagger from '../../../../src';

@Configuration({
  imports: [
    swagger
  ]
})
export class ContainerConfiguration {

}
