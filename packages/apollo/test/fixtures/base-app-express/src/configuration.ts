import { Configuration } from '@midwayjs/core';
import { join } from 'path';
import * as express from '@midwayjs/express';
import * as apollo from '../../../../src';

@Configuration({
  imports: [express, apollo],
  importConfigs: [join(__dirname, './config')],
})
export class ContainerConfiguration {}
