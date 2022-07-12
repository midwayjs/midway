import {
  initializeGlobalApplicationContext,
  MidwayFrameworkService,
  wrapAsync,
} from '@midwayjs/core';
import type {
  ServerlessStarterOptions,
  IFaaSConfigurationOptions,
  FC,
} from '@midwayjs/faas';
import * as getRawBody from 'raw-body';

function isOutputError() {
  return (
    process.env.SERVERLESS_OUTPUT_ERROR_STACK === 'true' ||
    ['local', 'development'].includes(process.env.MIDWAY_SERVER_ENV) ||
    ['local', 'development'].includes(process.env.NODE_ENV)
  );
}

export class BootstrapStarter {
  applicationContext;
  start(options: ServerlessStarterOptions = {}) {
    if (!process.env.NODE_ENV) {
      process.env.NODE_ENV = 'production';
    }

    if (process.env['FC_FUNC_CODE_PATH']) {
      // 用于替换默认的上下文日志
      process.env['MIDWAY_SERVERLESS_REPLACE_LOGGER'] = 'true';
      // 移除控制台颜色，fc 控制台无法探测是否支持，日志采集也必须把颜色禁用掉
      process.env['MIDWAY_LOGGER_DISABLE_COLORS'] = 'true';
    }
    const exports = {};
    let framework;

    exports[options.initializeMethodName || 'initializer'] = wrapAsync(
      async (context: FC.InitializeContext) => {
        const applicationAdapter = {
          getFunctionName() {
            return context.function.name;
          },
          getFunctionServiceName() {
            return context.service.name;
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

        const handlerWrapper = wrapAsync(async (event, context, oldContext) => {
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

          const triggerFunction = framework.getTriggerFunction(
            oldContext?.function.handler || context.function.handler
          );

          let ctx;
          if (isHTTPMode) {
            (event as any).getOriginContext = () => {
              return oldContext;
            };

            // 如果需要解析body并且body是个stream
            if (
              ['post', 'put', 'delete'].indexOf(event.method.toLowerCase()) !==
                -1 &&
              !(event as any).body &&
              typeof event.on === 'function'
            ) {
              (event as any).body = await getRawBody(event, {
                limit: '10mb',
              });
            }
            ctx = await framework.wrapHttpRequest(event);
          } else if (isApiGateway) {
            ctx = await framework.wrapHttpRequest(event, context);
          } else {
            // 阿里云事件触发器，入参是 buffer
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
            const result = await triggerFunction(ctx, {
              isHttpFunction: isHTTPMode || isApiGateway,
              originEvent: event,
              originContext: context,
            });
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
              res.send(isOutputError() ? err.stack : 'Internal Server Error');
            }
            return {
              isBase64Encoded: false,
              statusCode: err.status ?? 500,
              headers: {},
              body: isOutputError() ? err.stack : 'Internal Server Error',
            };
          }
        });

        for (const handlerName of framework.getAllHandlerNames()) {
          exports[handlerName.split('.')[1]] = handlerWrapper;
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
