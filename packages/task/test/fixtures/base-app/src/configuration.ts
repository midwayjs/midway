import { Configuration } from '@midwayjs/decorator';
import * as task from '../../../../src';

@Configuration({
  imports: [
    task
  ]
})
export class ContainerConfiguration {
}
