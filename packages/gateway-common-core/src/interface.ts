import { Context, Request as KoaRequest } from 'koa';
import { NextFunction, Request, Response } from 'express';
import { InvokeOptions } from '@midwayjs/serverless-invoke';

export { InvokeOptions } from '@midwayjs/serverless-invoke';

export type InvokeCallback = (result: InvokeOptions) => Promise<any>;

export interface ExpressGatewayAdapter {
  transform(
    req: Request,
    res: Response,
    next: NextFunction,
    invoke: InvokeCallback
  );
}

export interface KoaGatewayAdapter {
  transform(ctx: Context, next: () => Promise<any>, invoke: InvokeCallback);
}

export type CreateExpressGateway = (
  options?: DevPackOptions
) => ExpressGatewayAdapter;
export type CreateKoaGateway = (options?: DevPackOptions) => KoaGatewayAdapter;

export interface DevPackOptions {
  functionDir: string; // 本地目录，默认 process.cwd()
  sourceDir?: string; // 一体化调用时，需要知道当前的函数目录结构
  apiPath?: string | RegExp; // 只有匹配到这个才会执行函数逻辑
  ignorePattern?: string[] | ((req: Request | KoaRequest) => boolean); // 中后台下，特定的路由会忽略交给 webpackServer 去执行，比如 assets 地址
  ignoreWildcardFunctions?: string[]; // 忽略通配的函数名
  originGatewayName?: string; // 配置在 yml 里的 apiGatway 的 type
  verbose?: boolean; // 展示更多信息
}
