import { IMidwayApplication, IMidwayContext } from '@midwayjs/core';
import { DefaultState, Middleware } from 'koa';
import { IMidwayKoaContext } from '@midwayjs/koa';

declare module 'egg' {
  interface EggAppInfo {
    appDir: string;
  }

  interface Application extends IMidwayApplication {
    generateController?(controllerMapping: string);
    generateMiddleware?(middlewareId: string): Promise<Middleware<DefaultState, IMidwayKoaContext>>;
  }

  interface Context extends IMidwayContext {
  }
}
