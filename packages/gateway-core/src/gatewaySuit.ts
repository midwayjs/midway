// 这个文件只是为了提供各个网关简单的测试方法，只会在单测中使用，所以 express/koa 依赖都会在 dev 中
import * as request from 'supertest';
import * as express from 'express';
import * as koa from 'koa';
import { join } from 'path';
import * as expressBodyParser from 'body-parser';
import * as koaBodyParser from 'koa-bodyparser';
import { DevPackOptions } from '.';
import { invoke } from '@midwayjs/serverless-invoke';

export interface GatewaySuitOptions extends Partial<DevPackOptions> {
  functionDir?: string;
  gatewayDir?: string;
  invokeCallback?: () => {};
}

export const createKoaSuit = (options: GatewaySuitOptions = {}) => {
  if (!options.gatewayDir) {
    options.gatewayDir = join(process.cwd(), 'src');
  }
  const app = new koa();
  app.use(
    koaBodyParser({
      enableTypes: ['form', 'json'],
    })
  );
  const { createKoaGateway } = require(options.gatewayDir);
  app.use(async (ctx, next) => {
    await createKoaGateway(options).transform(
      ctx,
      next,
      options.invokeCallback || invoke
    );
  });

  return request(app.callback());
};

export const createExpressSuit = (options: GatewaySuitOptions = {}) => {
  if (!options.gatewayDir) {
    options.gatewayDir = join(process.cwd(), 'src');
  }
  const app = express();
  app.use(expressBodyParser.urlencoded({ extended: false }));
  app.use(expressBodyParser.json());
  const { createExpressGateway } = require(options.gatewayDir);
  app.use((req, res, next) => {
    createExpressGateway(options).transform(
      req,
      res,
      next,
      options.invokeCallback || invoke
    );
  });

  return request(app);
};
