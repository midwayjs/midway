import {
  CreateExpressGateway,
  CreateKoaGateway,
  DevPackOptions,
  ExpressGatewayAdapter,
  InvokeCallback,
  KoaGatewayAdapter,
} from '@midwayjs/gateway-core';
import { Context } from 'koa';
import { NextFunction, Request, Response } from 'express';
import { parseInvokeOptionsByOriginUrl } from './common';
import { getHeaderValue } from './utils';

export class KoaGateway implements KoaGatewayAdapter {
  options: DevPackOptions;

  constructor(options: DevPackOptions) {
    this.options = options;
  }

  async transform(
    ctx: Context,
    next: () => Promise<any>,
    invoke: InvokeCallback
  ) {
    const invokeOptions = await parseInvokeOptionsByOriginUrl(
      this.options,
      ctx.request
    );
    if (!invokeOptions.functionName) {
      await next();
    } else {
      try {
        const result: {
          headers: object;
          statusCode: number;
          body: string;
          base64Encoded: boolean;
        } = await invoke({
          functionDir: invokeOptions.functionDir,
          functionName: invokeOptions.functionName,
          data: invokeOptions.data,
          sourceDir: invokeOptions.sourceDir,
          incremental: true,
          verbose: invokeOptions.verbose,
        });
        ctx.status = result.statusCode;
        let data;
        try {
          data = JSON.parse(result.body);
        } catch (err) {
          data = result.body;
        }
        ctx.body = data;
        for (const key in result.headers) {
          ctx.set(key, getHeaderValue(result.headers, key));
        }
      } catch (err) {
        ctx.body = err.stack;
        ctx.status = 500;
      }
    }
  }
}

export class ExpressGateway implements ExpressGatewayAdapter {
  options: DevPackOptions;

  constructor(options: DevPackOptions) {
    this.options = options;
  }

  async transform(
    req: Request,
    res: Response,
    next: NextFunction,
    invoke: InvokeCallback
  ) {
    const invokeOptions = await parseInvokeOptionsByOriginUrl(
      this.options,
      req
    );
    if (!invokeOptions.functionName) {
      return next();
    } else {
      invoke({
        functionDir: invokeOptions.functionDir,
        functionName: invokeOptions.functionName,
        data: invokeOptions.data,
        sourceDir: invokeOptions.sourceDir,
        incremental: true,
        verbose: invokeOptions.verbose,
      })
        .then(
          (result: {
            headers: object;
            statusCode: number;
            body: string;
            base64Encoded: boolean;
          }) => {
            res.statusCode = result.statusCode;
            let data;
            try {
              data = JSON.parse(result.body);
            } catch (err) {
              data = result.body;
            }
            for (const key in result.headers) {
              res.setHeader(key, getHeaderValue(result.headers, key));
            }
            res.send(data);
          }
        )
        .catch((err) => {
          next(err);
        });
    }
  }
}

export const createKoaGateway: CreateKoaGateway = (options: DevPackOptions) => {
  return new KoaGateway(options);
};

export const createExpressGateway: CreateExpressGateway = (
  options: DevPackOptions
) => {
  return new ExpressGateway(options);
};
