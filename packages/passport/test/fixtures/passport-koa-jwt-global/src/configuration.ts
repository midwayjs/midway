import { Configuration, MainApp } from '@midwayjs/core';
import * as passport from '../../../../../passport/src';
import * as jwt from '@midwayjs/jwt';
import * as path from 'path';
import * as koa from '@midwayjs/koa';
import { JwtPassportMiddleware } from './jwt.middleware';

@Configuration({
  imports: [koa, passport, jwt],
  importConfigs: [path.join(__dirname, './config')],
})
export class ContainerLifeCycle {
  @MainApp()
  app: koa.Application;

  async onReady() {
    this.app.useMiddleware(JwtPassportMiddleware);
  }
}
