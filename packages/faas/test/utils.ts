import { Framework, Application, AbstractBootstrapStarter, IFaaSConfigurationOptions } from '../src';
import * as FaaS from '../src';
import { join } from 'path';
import { close, createLegacyApp, createLegacyFunctionApp } from '@midwayjs/mock';
import { wrapAsync } from '@midwayjs/core';

const originReady = FaaS.Configuration.prototype.init;
let isProxy = false;
let currentOptions;

export async function creatStarter(name, options: any = {}): Promise<any> {
  currentOptions = options;
  if (!isProxy) {
    FaaS.Configuration.prototype.init = async function () {
      this.framework.configure(currentOptions);
      await this.framework.initialize(currentOptions);
      await originReady.call(this);
    }
    isProxy = true;
  }

  options.imports = [
    ...options.imports ?? [],
    FaaS
  ]

  const app = await createLegacyApp<Framework>(join(__dirname, 'fixtures/legacy', name), options);
  return app.getFramework();
}

class BootstrapStarter extends AbstractBootstrapStarter {
  onStart() {
    const exports = {};

    exports[this.options.initializeMethodName || 'initializer'] = wrapAsync(
      async context => {
        await this.onInit(context, exports);
      }
    );

    if (this.options.handlerName) {
      exports[this.options.handlerName.split('.')[1]] = wrapAsync(
        this.onRequest.bind(this)
      );
    }

    if (this.options.aggregationHandlerName) {
      exports[this.options.aggregationHandlerName.split('.')[1]] = wrapAsync(
        this.onRequest.bind(this)
      );
    }

    return exports;
  }

  async onInit(
    context,
    exports
  ) {
    const applicationAdapter = {
      getFunctionName() {
        return context.function.name;
      },
      getFunctionServiceName() {
        return context.service.name;
      },
    } as IFaaSConfigurationOptions;

    await this.initFramework({
      globalConfig: {
        faas: {
          applicationAdapter,
        },
      },
      ...this.options,
    });

    const handlerWrapper = wrapAsync(this.onRequest.bind(this));

    for (const handlerName of this.framework.getAllHandlerNames()) {
      exports[handlerName.split('.')[1]] = handlerWrapper;
    }
  }

  async onRequest(event, context, oldContext) {
    const isHTTPMode =
      event.constructor.name === 'IncomingMessage' ||
      event.constructor.name === 'EventEmitter';

    const isApiGateway =
      event &&
      event.headers &&
      'queryParameters' in event &&
      'httpMethod' in event;

    if (isHTTPMode) {
      if (!oldContext.logger?.info) {
        oldContext.logger = console;
      }
    } else {
      if (!context.logger?.info) {
        context.logger = console;
      }
    }

    let handlerName = oldContext?.function.handler || context.function.handler;

    // 聚合部署的情况
    if (this.options.aggregationHandlerName) {
      if (this.options.handlerNameMapping) {
        [handlerName, event, context, oldContext] =
          this.options.handlerNameMapping(
            handlerName,
            event,
            context,
            oldContext
          );
      }
    }

    let ctx;
    if (isHTTPMode) {
      (event as any).getOriginContext = () => {
        return oldContext;
      };
      ctx = await this.framework.wrapHttpRequest(event);
    } else if (isApiGateway) {
      ctx = await this.framework.wrapHttpRequest(event, context);
    } else {
      if (Buffer.isBuffer(event)) {
        event = event.toString('utf8');
        try {
          event = JSON.parse(event);
        } catch (_err) {
          /** ignore */
        }
      }
      // format context
      ctx = {
        originEvent: event,
        originContext: context,
        logger: context.logger,
      };
    }

    try {
      const result = await this.framework.invokeTriggerFunction(
        ctx,
        handlerName,
        {
          isHttpFunction: isHTTPMode || isApiGateway,
        }
      );
      if (isHTTPMode || isApiGateway) {
        const { isBase64Encoded, statusCode, headers, body } = result;

        if (isApiGateway) {
          const newHeader = {};
          for (const key in headers) {
            // The length after base64 is wrong.
            if (!['content-length'].includes(key)) {
              if ('set-cookie' === key && !isHTTPMode) {
                // unsupport multiple cookie when use apiGateway
                newHeader[key] = headers[key][0];
                if (headers[key].length > 1) {
                  ctx.logger.warn(
                    '[fc-starter]: unsupport multiple cookie when use apiGateway'
                  );
                }
              } else {
                newHeader[key] = headers[key];
              }
            }
          }
          return {
            isBase64Encoded,
            statusCode,
            headers: newHeader,
            body,
          };
        } else {
          const res = context;
          if (res.headersSent) {
            return;
          }

          if (res.setHeader) {
            for (const key in headers) {
              res.setHeader(key, headers[key]);
            }
          }

          if (res.statusCode !== statusCode) {
            if ((res as any).setStatusCode) {
              (res as any).setStatusCode(statusCode);
            }

            if (res.statusCode) {
              res.statusCode = statusCode;
            }
          }

          if ((res as any).send) {
            // http trigger only support `Buffer` or a `string` or a `stream.Readable`
            (res as any).send(body);
          }
        }
      } else {
        return result;
      }
    } catch (err) {
      ctx.logger.error(err);
      const res = context;
      if (res.setHeader) {
        res.setHeader('content-type', 'text/plain');
      }
      if (res.send) {
        res.setStatusCode(err.status ?? 500);
        res.send('Internal Server Error');
      }
      return {
        isBase64Encoded: false,
        statusCode: err.status ?? 500,
        headers: {},
        body: 'Internal Server Error',
      };
    }
  }

  async onClose() {}
}

export async function createNewStarter(name, options = {}): Promise<Application> {
  const basePath = join(__dirname, 'fixtures', name);
  const app = await createLegacyFunctionApp<Framework>(basePath, Object.assign({
    starter: new BootstrapStarter(),
    imports: [
      require('../src'),
      require(`${basePath}/src`)
    ]
  }, options));
  return app;
}

export async function closeApp(framework) {
  return close(framework);
}
