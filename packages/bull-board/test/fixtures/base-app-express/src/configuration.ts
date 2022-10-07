import { Configuration } from '@midwayjs/core';
import * as bullBoard from '../../../../src';
import { join } from 'path'
import * as express from '@midwayjs/express';

@Configuration({
  imports: [express, bullBoard],
  importConfigs: [join(__dirname, 'config')]
})
export class AutoConfiguration {

  async onReady(){
  }
}
