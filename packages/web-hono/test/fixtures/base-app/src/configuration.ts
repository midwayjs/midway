import { Configuration } from '@midwayjs/core';
import * as hono from '../../../../src';

@Configuration({
  imports: [hono],
})
export class AutoConfiguration {}
