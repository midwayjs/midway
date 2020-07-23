import {
  CreateExpressGateway,
  CreateKoaGateway,
  DevPackOptions,
  ExpressGatewayAdapter,
  InvokeCallback,
  KoaGatewayAdapter,
} from '@midwayjs/gateway-common-core';
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
    const {
      invokeOptions,
      invokeFun = invoke,
    } = await parseInvokeOptionsByOriginUrl(this.options, ctx.request, invoke);
    if (!invokeOptions.functionName) {
      await next();
    } else {
      try {
        const result: {
          headers: object;
          statusCode: number;
          body: string;
          isBase64Encoded: boolean;
        } = await invokeFun({
          functionDir: invokeOptions.functionDir,
          functionName: invokeOptions.functionName,
          data: invokeOptions.data,
          sourceDir: invokeOptions.sourceDir,
          incremental: true,
          verbose: invokeOptions.verbose,
        });
        let data;
        ctx.status = result.statusCode;
        if (result.isBase64Encoded) {
          // base64 to buffer
          data = Buffer.from(result.body, 'base64');
        } else {
          try {
            data = JSON.parse(result.body);
          } catch (err) {
            data = result.body;
          }
        }
        for (const key in result.headers) {
          ctx.set(key, getHeaderValue(result.headers, key));
        }
        ctx.body = data;
      } catch (err) {
        ctx.body = err.stack;
        ctx.status = 500;
      }
      await next();
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
    const {
      invokeOptions,
      invokeFun = invoke,
    } = await parseInvokeOptionsByOriginUrl(this.options, req, invoke);
    if (!invokeOptions.functionName) {
      return next();
    } else {
      invokeFun({
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
            isBase64Encoded: boolean;
          }) => {
            let data;
            res.statusCode = result.statusCode;
            if (result.isBase64Encoded) {
              // base64 to buffer
              data = Buffer.from(result.body, 'base64');
            } else {
              try {
                data = JSON.parse(result.body);
              } catch (err) {
                data = result.body;
              }
            }

            for (const key in result.headers) {
              res.setHeader(key, getHeaderValue(result.headers, key));
            }
            res.send(data);
          }
        )
        .catch(err => {
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
