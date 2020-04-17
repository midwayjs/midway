import {
  CreateKoaGateway,
  CreateExpressGateway,
  ExpressGatewayAdapter,
  KoaGatewayAdapter,
  InvokeCallback,
  DevPackOptions,
} from '../src';
import { NextFunction, Request, Response } from 'express';
import { Context } from 'koa';

export class KoaGateway implements KoaGatewayAdapter {
  options: DevPackOptions;

  constructor(options) {
    this.options = options;
  }

  async transform(
    ctx: Context,
    next: () => Promise<any>,
    invoke: InvokeCallback
  ) {
    ctx.body = '123';
  }
}

export class ExpressGateway implements ExpressGatewayAdapter {
  options: DevPackOptions;

  constructor(options) {
    this.options = options;
  }

  async transform(
    req: Request,
    res: Response,
    next: NextFunction,
    invoke: InvokeCallback
  ) {
    res.send('321');
  }
}

export const createKoaGateway: CreateKoaGateway = options => {
  return new KoaGateway(options);
};

export const createExpressGateway: CreateExpressGateway = options => {
  return new ExpressGateway(options);
};
