import { Configuration } from '@midwayjs/core';
import * as commander from '@midwayjs/commander';

@Configuration({
  imports: [commander],
})
export class MainConfiguration {}
