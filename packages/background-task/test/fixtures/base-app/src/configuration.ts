import { Configuration } from '@midwayjs/core';
import * as bg from '../../../../src';

@Configuration({
  imports: [bg]
})
export class ContainerConfiguration {}
