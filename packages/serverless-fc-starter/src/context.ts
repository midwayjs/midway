import { Context as HTTPContext } from '@midwayjs/serverless-http-parser';

export class Context extends HTTPContext {
  requestId;
  credentials;
  function;
  originContext: null;

  constructor(req, res, context) {
    super(req, res);
    this.requestId = context.requestId;
    this.credentials = context.credentials;
    this.function = context.function;
    this.originContext = context;
  }
}
