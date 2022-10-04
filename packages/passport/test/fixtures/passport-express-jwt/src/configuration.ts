import { App, Configuration } from '@midwayjs/core';
import * as passport from '../../../../../passport/src';
import * as jwt from '@midwayjs/jwt';
import * as path from 'path';
import { IMidwayExpressApplication } from '@midwayjs/express';
import * as express from '@midwayjs/express';

@Configuration({
  imports: [express, passport, jwt],
  conflictCheck: true,
  importConfigs: [path.join(__dirname, './config')],
})
export class ContainerLifeCycle {
  @App()
  app: IMidwayExpressApplication;
}
