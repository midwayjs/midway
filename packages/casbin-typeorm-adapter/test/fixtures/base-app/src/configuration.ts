import { App, Configuration, Init, Inject } from '@midwayjs/core';
import * as koa from '@midwayjs/koa';
import * as casbin from '@midwayjs/casbin';
import * as typeorm from '@midwayjs/typeorm';
import { join } from 'path';
import { Enforcer } from 'casbin';
import { TypeORMAdapter } from '../../../../src';

@Configuration({
  imports: [
    koa,
    typeorm,
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
  typeORMDataSourceManager: typeorm.TypeORMDataSourceManager;

  @Init()
  async init() {
    let e = new Enforcer();
    await e.initWithFile(
      join(__dirname, '../basic_model.conf'),
      join(__dirname, '../basic_policy.csv'),
    );
    const adapter = new TypeORMAdapter(this.typeORMDataSourceManager.getDataSource('node-casbin-official'), {});
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
