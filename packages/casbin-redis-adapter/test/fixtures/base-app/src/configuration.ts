import { App, Configuration, Init, Inject } from '@midwayjs/core';
import * as koa from '@midwayjs/koa';
import * as casbin from '@midwayjs/casbin';
import { join } from 'path';
import { Enforcer } from 'casbin';
import { NodeRedisAdapter } from '../../../../src';
import * as redis from '@midwayjs/redis';

@Configuration({
  imports: [
    koa,
    redis,
    casbin
  ],
  importConfigs: [
    join(__dirname, 'config')
  ]
})
export class ContainerConfiguration {

  @App('koa')
  app;

  @Inject()
  redisServiceFactory: redis.RedisServiceFactory;

  @Init()
  async init() {
    let e = new Enforcer();
    await e.initWithFile(
      join(__dirname, '../basic_model.conf'),
      join(__dirname, '../basic_policy.csv'),
    );
    const adapter = new NodeRedisAdapter(this.redisServiceFactory.get('node-casbin-official'));
    await adapter.savePolicy(e.getModel());
  }

  async onReady() {
    // save from file
    this.app.useMiddleware(async (ctx, next) => {
      ctx.user = ctx.query.username;
      await next();
    });
  }
}
