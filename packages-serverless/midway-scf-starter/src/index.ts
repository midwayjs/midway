import {
  initializeGlobalApplicationContext,
  MidwayFrameworkService,
} from '@midwayjs/core';
import {
  asyncWrapper,
  ServerlessStarterOptions,
  IFaaSConfigurationOptions,
  SCF,
} from '@midwayjs/faas';

function isOutputError() {
  return (
    process.env.SERVERLESS_OUTPUT_ERROR_STACK === 'true' ||
    ['local', 'development'].includes(process.env.MIDWAY_SERVER_ENV) ||
    ['local', 'development'].includes(process.env.NODE_ENV)
  );
}

function isHttpEvent(event): event is SCF.APIGatewayEvent {
  return event?.httpMethod && event?.headers && event?.requestContext;
}

export class BootstrapStarter {
  applicationContext;

  start(options: ServerlessStarterOptions = {}) {
    if (!process.env.NODE_ENV) {
      process.env.NODE_ENV = 'production';
    }

    const exports = {};
    let framework;

    exports[options.initializeMethodName || 'initializer'] = asyncWrapper(
      async (context: SCF.RequestContext) => {
        const handlerMethodName = context.function.handler.split('.')[1];

        const applicationAdapter = {
          getFunctionName() {
            // https://cloud.tencent.com/document/product/583/30228
            return process.env.SCF_FUNCTIONNAME;
          },
          getFunctionServiceName() {
            // 腾讯云没有服务名
            return '';
          },
        } as IFaaSConfigurationOptions;

        options.performance?.mark('starterRuntimeStartTime');

        // init midway
        const applicationContext = (this.applicationContext =
          await initializeGlobalApplicationContext(
            Object.assign(options, {
              globalConfig: {
                faas: {
                  applicationAdapter,
                },
              },
            })
          ));

        options.performance?.mark('frameworkStartTime');

        const midwayFrameworkService = applicationContext.get(
          MidwayFrameworkService
        );
        framework = midwayFrameworkService.getMainFramework();

        const handlerWrapper = asyncWrapper(async (event, context) => {
          const isHTTPMode = isHttpEvent(event);

          const triggerFunction = framework.getTriggerFunction(
            context.function.handler
          );

          let ctx;
          if (isHTTPMode) {
            ctx = await framework.wrapHttpRequest(event, context);
          } else {
            // format context
            ctx = {
              originEvent: event,
              originContext: context,
              logger: context.logger || console,
            };
          }

          try {
            const result = await triggerFunction(ctx, {
              isHttpFunction: isHTTPMode,
              originEvent: event,
              originContext: context,
            });
            if (isHTTPMode) {
              const { isBase64Encoded, statusCode, headers, body } = result;
              const newHeader = {};
              for (const key in headers) {
                // The length after base64 is wrong.
                if (!['content-length'].includes(key)) {
                  newHeader[key] = headers[key];
                }
              }
              // 不再等待事件循环
              // https://cloud.tencent.com/document/product/583/11060
              context.callbackWaitsForEmptyEventLoop = false;
              if (isHTTPMode) {
                return {
                  isBase64Encoded,
                  statusCode,
                  headers: newHeader,
                  body,
                };
              }
            } else {
              return result;
            }
          } catch (err) {
            ctx.logger.error(err);
            if (isHTTPMode) {
              context.callbackWaitsForEmptyEventLoop = false;
              return {
                isBase64Encoded: false,
                statusCode: err.status ?? 500,
                headers: {},
                body: isOutputError() ? err.stack : 'Internal Server Error',
              };
            } else {
              if (isOutputError()) {
                throw err;
              } else {
                throw new Error('Internal Server Error');
              }
            }
          }
        });

        if (options.exportAllHandler) {
          for (const handlerName of framework.getAllHandlerNames()) {
            exports[handlerName.split('.')[1]] = handlerWrapper;
          }
        } else {
          exports[handlerMethodName] = handlerWrapper;
        }

        options.performance?.end();
      }
    );

    return exports;
  }

  getApplicationContext() {
    return this.applicationContext;
  }
}
