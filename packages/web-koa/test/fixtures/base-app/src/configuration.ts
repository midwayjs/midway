import { Configuration, App, Inject, Catch } from '@midwayjs/decorator';
import * as bodyParser from 'koa-bodyparser';
import * as session from 'koa-session';
import { join } from 'path';
import { Framework, Context } from '../../../../src';
import { BadGatewayException, IExceptionFilter } from '@midwayjs/core';

@Catch(BadGatewayException)
export class BadGatewayFilter implements IExceptionFilter<Context>{
  async catch(err: BadGatewayException, ctx: Context) {
    return {
      status: err.status,
      message: err.message,
    }
  }
}

@Catch()
export class AllExceptionFilter {
  async catch(err, ctx) {
    return {
      status: 500,
      message: 'default error value'
    }
  }
}

@Configuration({
  importConfigs: [
    join(__dirname, './config'),
  ],
  conflictCheck: true,
})
export class ContainerConfiguration {

  @App()
  app;

  @Inject()
  framework: Framework;

  async onReady() {
    this.app.keys = ['some secret hurr'];

    this.framework.useMiddleware(session({
      key: 'koa.sess',
      maxAge: 86400000,
      httpOnly: true,
    }, this.app));

    this.framework.useMiddleware(bodyParser());

    this.framework.useFilter([BadGatewayFilter, AllExceptionFilter]);
  }
}
