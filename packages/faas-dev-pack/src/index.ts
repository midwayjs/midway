import { resolveModule, invokeFunction } from './common';
import {
  DevPackOptions,
  CreateExpressGateway,
  CreateKoaGateway,
} from '@midwayjs/gateway-common-core';
import { NextFunction, Request, Response } from 'express';
import { Context } from 'koa';
import * as koaBodyParser from 'koa-bodyparser';
import * as expressBodyParser from 'body-parser';
import * as compose from 'koa-compose';
import { compose as expressCompose } from 'compose-middleware';

export function useExpressDevPack(options: DevPackOptions) {
  options.functionDir = options.functionDir || process.cwd();

  return expressCompose([
    expressBodyParser.urlencoded({ extended: false }),
    expressBodyParser.json(),
    async (req: Request, res: Response, next: NextFunction) => {
      const gatewayName = 'http';
      if (!gatewayName) {
        return next();
      }
      const createExpressGateway: CreateExpressGateway = resolveModule(
        gatewayName
      ).createExpressGateway;
      options.originGatewayName = gatewayName;
      const gateway = createExpressGateway(options);
      gateway.transform(req, res, next, invokeFunction);
    },
  ]);
}

export function useKoaDevPack(options: DevPackOptions) {
  options.functionDir = options.functionDir || process.cwd();

  return compose([
    koaBodyParser({
      enableTypes: ['form', 'json'],
    }),
    async (ctx: Context, next: () => Promise<any>) => {
      const gatewayName = 'http';
      if (!gatewayName) {
        await next();
      } else {
        const createKoaGateway: CreateKoaGateway = resolveModule(gatewayName)
          .createKoaGateway;

        options.originGatewayName = gatewayName;
        const gateway = createKoaGateway(options);
        await gateway.transform(ctx, next, invokeFunction);
      }
    },
  ]);
}
