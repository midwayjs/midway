import { Configuration } from '@midwayjs/core';
import * as cacheComponent from '../../../../src/index';

@Configuration({
  imports: [
    cacheComponent
  ]
})
export class ContainerLifeCycle {
}
