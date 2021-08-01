import * as getRawBody from 'raw-body';
import { ServerlessLightRuntime } from '@midwayjs/runtime-engine';
import { Application, HTTPResponse } from '@midwayjs/serverless-http-parser';
import * as parseurl from 'parseurl';

const isOutputError = () => {
  return (
    process.env.SERVERLESS_OUTPUT_ERROR_STACK === 'true' ||
    ['local', 'development'].includes(process.env.MIDWAY_SERVER_ENV) ||
    ['local', 'development'].includes(process.env.NODE_ENV)
  );
};

export class VercelRuntime extends ServerlessLightRuntime {
  app;
  respond;

  init(contextExtensions) {
    super.init(contextExtensions);
    this.app = new Application();
  }

  /**
   * for handler wrapper
   * @param handler
   */
  asyncEvent(handler) {
    if (handler && handler.constructor.name !== 'AsyncFunction') {
      throw new TypeError('Must be an AsyncFunction');
    }

    return (...args) => {
      const [req, res] = args;
      return this.wrapperWebInvoker(handler, req, res);
    };
  }

  async wrapperWebInvoker(handler, req, res) {
    if (!this.respond) {
      this.respond = this.app.callback();
    }

    const newRes = new HTTPResponse();

    req.getOriginContext = () => {
      return {};
    };

    // vercel req is IncomingMessage , no path
    const newUrlInfo = parseurl({ url: req.url });
    req.path = newUrlInfo.pathname;

    if (
      ['post', 'put', 'delete'].indexOf(req.method.toLowerCase()) !== -1 &&
      !req.body &&
      typeof req.on === 'function'
    ) {
      req.body = await getRawBody(req); // TODO: body parser
    }
    const newReq = req;

    return this.respond.apply(this.respond, [
      newReq,
      newRes,
      ctx => {
        return this.invokeHandlerWrapper(ctx, async () => {
          if (!handler) {
            const args = [ctx];
            return this.defaultInvokeHandler(...args);
          }
          return handler.apply(handler, [ctx]);
        })
          .then(result => {
            if (res.headersSent) {
              return;
            }

            if (result) {
              ctx.body = result;
            }

            if (!ctx.response._explicitStatus) {
              if (ctx.body === null || ctx.body === 'undefined') {
                ctx.body = '';
                ctx.type = 'text';
                ctx.status = 204;
              }
            }

            let data = ctx.body;
            if (typeof data === 'string') {
              if (!ctx.type) {
                ctx.type = 'text/plain';
              }
              ctx.body = data;
            } else if (Buffer.isBuffer(data)) {
              if (!ctx.type) {
                ctx.type = 'application/octet-stream';
              }
              ctx.body = data;
            } else if (typeof data === 'object') {
              if (!ctx.type) {
                ctx.type = 'application/json';
              }
              // set data to string
              ctx.body = data = JSON.stringify(data);
            } else {
              if (!ctx.type) {
                ctx.type = 'text/plain';
              }
              // set data to string
              ctx.body = data = data + '';
            }

            const newHeader = {};

            for (const key in ctx.res.headers) {
              // The length after base64 is wrong.
              if (!['content-length'].includes(key)) {
                newHeader[key] = ctx.res.headers[key];
              }
            }

            for (const key in newHeader) {
              res.setHeader(key, newHeader[key]);
            }

            if (res.statusCode !== ctx.status) {
              res.status(ctx.status);
            }
            res.send(data);
          })
          .catch(err => {
            ctx.logger.error(err);
            res.status(500);
            res.send(isOutputError() ? err.stack : 'Internal Server Error');
          });
      },
    ]);
  }

  async beforeInvokeHandler(context) {}

  async afterInvokeHandler(err, result, context) {}

  getApplication() {
    return this.app;
  }

  getFunctionName(): string {
    return this.options?.initContext?.function?.name || super.getFunctionName();
  }

  getFunctionServiceName(): string {
    return (
      this.options?.initContext?.service?.name || super.getFunctionServiceName()
    );
  }
}
