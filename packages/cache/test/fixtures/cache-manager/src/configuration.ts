import { Configuration } from '@midwayjs/decorator';
import * as cacheComponent from '../../../../src/index';

@Configuration({
  imports: [
    cacheComponent
  ]
})
export class ContainerLifeCycle {
}
