import {
  BaseFramework,
  CommonMiddlewareUnion,
  ContextMiddlewareManager,
  HTTP_SERVER_KEY,
  IMidwayBootstrapOptions,
  Types,
  WS_CONTROLLER_KEY,
  WS_EVENT_KEY,
  WSEventInfo,
  WSEventTypeEnum,
  Framework,
  WSControllerOption,
  MidwayInvokeForbiddenError,
  DecoratorManager,
  MetadataManager,
  MidwayTraceService,
} from '@midwayjs/core';
import * as http from 'http';
import { debuglog } from 'util';
const debug = debuglog('midway:debug');

import {
  Application,
  Context,
  IMidwayWSApplication,
  IMidwayWSConfigurationOptions,
  IMidwayWSContext,
  NextFunction,
  UpgradeAuthHandler,
} from './interface';
import * as WebSocket from 'ws';

@Framework()
export class MidwayWSFramework extends BaseFramework<
  Application,
  Context,
  IMidwayWSConfigurationOptions
> {
  server: http.Server;
  protected heartBeatInterval: NodeJS.Timeout;
  protected connectionMiddlewareManager = this.createMiddlewareManager();
  protected upgradeAuthHandler: UpgradeAuthHandler | null = null;
  protected frameworkLoggerName = 'wsLogger';

  configure(): IMidwayWSConfigurationOptions {
    return this.configService.getConfiguration('webSocket');
  }

  async applicationInitialize(options: IMidwayBootstrapOptions) {
    this.configurationOptions.noServer = true;
    const opts = Object.assign({}, this.configurationOptions, { port: null });
    this.app = new WebSocket.Server(opts) as IMidwayWSApplication;
    this.defineApplicationProperties({
      useConnectionMiddleware: (
        middleware: CommonMiddlewareUnion<Context, NextFunction, undefined>
      ) => {
        return this.useConnectionMiddleware(middleware);
      },
      getConnectionMiddleware: (): ContextMiddlewareManager<
        Context,
        NextFunction,
        undefined
      > => {
        return this.getConnectionMiddleware();
      },
      onWebSocketUpgrade: (handler: UpgradeAuthHandler) => {
        return this.onWebSocketUpgrade(handler);
      },
    });

    await this.loadMidwayController();
  }

  public async run(): Promise<void> {
    let server: http.Server;
    if (!this.configurationOptions.port) {
      server = this.applicationContext.get(HTTP_SERVER_KEY);
      this.logger.info(
        '[midway:ws] WebSocket server find shared http server and will be attach.'
      );
    } else {
      server = this.configurationOptions.server ?? http.createServer();
    }

    if (this.configurationOptions.enableServerHeartbeatCheck) {
      if (server.listening) {
        this.startHeartBeat();
      } else {
        server.on('listening', () => {
          this.startHeartBeat();
        });
      }
    }

    server.on('upgrade', async (request, socket: any, head: Buffer) => {
      // check if the upgrade auth handler is set
      if (this.upgradeAuthHandler) {
        try {
          const authResult = await this.upgradeAuthHandler(
            request,
            socket,
            head
          );
          if (!authResult) {
            this.logger.warn(
              '[midway:ws] WebSocket upgrade authentication failed'
            );
            socket.destroy();
            return;
          }
          this.logger.debug(
            '[midway:ws] WebSocket upgrade authentication passed'
          );
        } catch (error) {
          this.logger.error(
            '[midway:ws] WebSocket upgrade authentication error:',
            error
          );
          socket.destroy();
          return;
        }
      }

      this.app.handleUpgrade(request, socket, head, ws => {
        this.app.emit('connection', ws, request);
      });
    });

    this.server = server;

    if (this.configurationOptions.port) {
      await new Promise<void>(resolve => {
        server.listen(this.configurationOptions.port, () => {
          this.logger.info(
            `[midway:ws] WebSocket server port = ${this.configurationOptions.port} start success.`
          );
          resolve();
        });
      });
    }

    this.app.on('error', err => {
      this.logger.error('socket server got error', err);
    });

    this.app.on('close', () => {
      if (this.heartBeatInterval) {
        clearInterval(this.heartBeatInterval);
      }
      this.logger.info('socket server close');
    });
  }

  protected async beforeStop(): Promise<void> {
    return new Promise<void>(resolve => {
      this.app.close(() => {
        setTimeout(() => {
          resolve();
        }, 1000);
      });
      this.server.close();
    });
  }

  /**
   * 设置升级前鉴权处理函数
   * @param handler 鉴权处理函数，传入 null 可以禁用鉴权
   */
  public onWebSocketUpgrade(handler: UpgradeAuthHandler | null): void {
    this.upgradeAuthHandler = handler;
    if (handler) {
      this.logger.info(
        '[midway:ws] WebSocket upgrade authentication handler set'
      );
    } else {
      this.logger.info(
        '[midway:ws] WebSocket upgrade authentication handler removed'
      );
    }
  }

  private async loadMidwayController() {
    // create room
    const controllerModules = DecoratorManager.listModule(WS_CONTROLLER_KEY);
    if (controllerModules.length > 0) {
      // ws just one namespace
      await this.addNamespace(controllerModules[0]);
    }
  }

  private async addNamespace(target: any) {
    const controllerOption: WSControllerOption = MetadataManager.getOwnMetadata(
      WS_CONTROLLER_KEY,
      target
    );
    const controllerMiddleware =
      controllerOption.routerOptions.middleware ?? [];
    const controllerConnectionMiddleware =
      controllerOption.routerOptions.connectionMiddleware ?? [];

    this.app.on(
      'connection',
      async (socket: IMidwayWSContext, request: http.IncomingMessage) => {
        const traceService = this.applicationContext.get(MidwayTraceService);
        const traceMetaResolver = this.configurationOptions?.tracing?.meta;
        socket.isAlive = true;
        socket.on('error', error => {
          this.logger.error(`socket got error: ${error}`);
        });
        socket.on('pong', () => {
          socket.isAlive = true;
        });
        // create request context
        this.app.createAnonymousContext(socket);
        socket.requestContext.registerObject('socket', socket);
        socket.request = request;
        socket.app = this.app;

        // run connection middleware
        const connectFn = await this.middlewareService.compose(
          [
            ...this.connectionMiddlewareManager,
            ...controllerConnectionMiddleware,
          ],
          this.app
        );
        await traceService.runWithEntrySpan(
          `ws.connect ${request.url || '/'}`,
          {
            carrier: request.headers,
            attributes: {
              'midway.protocol': 'ws',
              'midway.ws.event': 'connection',
            },
            meta: traceMetaResolver,
            metaArgs: {
              ctx: socket,
              carrier: request.headers,
              request,
            },
          },
          async () => {
            await connectFn(socket);
          }
        );

        const wsEventInfos: WSEventInfo[] = MetadataManager.getMetadata(
          WS_EVENT_KEY,
          target
        );

        // 存储方法对应的响应处理
        const methodMap = {};

        if (wsEventInfos.length) {
          for (const wsEventInfo of wsEventInfos) {
            methodMap[wsEventInfo.propertyName] = methodMap[
              wsEventInfo.propertyName
            ] || { responseEvents: [] };
            const controller = await socket.requestContext.getAsync(target);
            // on connection
            if (wsEventInfo.eventType === WSEventTypeEnum.ON_CONNECTION) {
              try {
                const result = await traceService.runWithEntrySpan(
                  `ws.event ${wsEventInfo.propertyName}`,
                  {
                    carrier: request.headers,
                    attributes: {
                      'midway.protocol': 'ws',
                      'midway.ws.event': wsEventInfo.propertyName,
                    },
                    meta: traceMetaResolver,
                    metaArgs: {
                      ctx: socket,
                      carrier: request.headers,
                      request,
                      custom: {
                        eventName: wsEventInfo.propertyName,
                      },
                    },
                  },
                  async () => {
                    const fn = await this.middlewareService.compose(
                      [
                        ...(wsEventInfo?.eventOptions?.middleware || []),
                        async (ctx, next) => {
                          const isPassed = await this.app
                            .getFramework()
                            .runGuard(ctx, target, wsEventInfo.propertyName);
                          if (!isPassed) {
                            throw new MidwayInvokeForbiddenError(
                              wsEventInfo.propertyName,
                              target
                            );
                          }

                          return controller[wsEventInfo.propertyName].apply(
                            controller,
                            [socket, request]
                          );
                        },
                      ],
                      this.app
                    );
                    return await fn(socket);
                  }
                );

                await this.bindSocketResponse(
                  result,
                  socket,
                  wsEventInfo.propertyName,
                  methodMap
                );
              } catch (err) {
                this.logger.error(err);
              }
            } else if (wsEventInfo.eventType === WSEventTypeEnum.ON_MESSAGE) {
              // on user custom event
              socket.on(wsEventInfo.messageEventName, async (...args) => {
                debug('[ws]: got message', wsEventInfo.messageEventName, args);

                try {
                  const result = await traceService.runWithEntrySpan(
                    `ws.message ${wsEventInfo.messageEventName}`,
                    {
                      carrier: request.headers,
                      attributes: {
                        'midway.protocol': 'ws',
                        'midway.ws.event': wsEventInfo.messageEventName,
                      },
                      meta: traceMetaResolver,
                      metaArgs: {
                        ctx: socket,
                        carrier: request.headers,
                        request,
                        custom: {
                          eventName: wsEventInfo.messageEventName,
                        },
                      },
                    },
                    async () => {
                      return await (
                        await this.applyMiddleware(async (ctx, next) => {
                          // add controller middleware
                          const fn = await this.middlewareService.compose(
                            [
                              ...controllerMiddleware,
                              ...(wsEventInfo?.eventOptions?.middleware || []),
                              async (ctx, next) => {
                                // eslint-disable-next-line prefer-spread
                                return controller[
                                  wsEventInfo.propertyName
                                ].apply(controller, args);
                              },
                            ],
                            this.app
                          );
                          return await fn(ctx, next);
                        })
                      )(socket);
                    }
                  );
                  if (typeof args[args.length - 1] === 'function') {
                    // ack
                    args[args.length - 1](result);
                  } else {
                    // emit
                    await this.bindSocketResponse(
                      result,
                      socket,
                      wsEventInfo.propertyName,
                      methodMap
                    );
                  }
                } catch (error) {
                  this.logger.error(error);
                }
              });
            } else if (
              wsEventInfo.eventType === WSEventTypeEnum.ON_DISCONNECTION
            ) {
              // on socket disconnect
              socket.on('close', async (reason: string) => {
                try {
                  const result = await traceService.runWithEntrySpan(
                    `ws.disconnect ${wsEventInfo.propertyName}`,
                    {
                      carrier: request.headers,
                      attributes: {
                        'midway.protocol': 'ws',
                        'midway.ws.event': 'disconnect',
                      },
                      meta: traceMetaResolver,
                      metaArgs: {
                        ctx: socket,
                        carrier: request.headers,
                        request,
                        custom: {
                          eventName: 'disconnect',
                        },
                      },
                    },
                    async () => {
                      return await controller[wsEventInfo.propertyName].apply(
                        controller,
                        [reason]
                      );
                    }
                  );
                  await this.bindSocketResponse(
                    result,
                    socket,
                    wsEventInfo.propertyName,
                    methodMap
                  );
                } catch (err) {
                  this.logger.error(err);
                }
              });
            } else {
              // 存储每个方法对应的后置响应处理，供后续快速匹配
              methodMap[wsEventInfo.propertyName].responseEvents.push(
                wsEventInfo
              );
            }
          }
        }
      }
    );
  }

  private async bindSocketResponse(
    result: any,
    socket: IMidwayWSContext,
    propertyName: string,
    methodMap: {
      responseEvents?: WSEventInfo[];
    }
  ) {
    const traceService = this.applicationContext.get(MidwayTraceService);
    const traceMetaResolver = this.configurationOptions?.tracing?.meta;
    const sendWithTrace = async (
      currentSocket: IMidwayWSContext | WebSocket,
      payload: any,
      eventName: string
    ) => {
      const carrier = {};
      await traceService.runWithExitSpan(
        `ws.emit ${eventName}`,
        {
          carrier,
          attributes: {
            'midway.protocol': 'ws',
            'midway.ws.event': eventName,
          },
          meta: traceMetaResolver,
          metaArgs: {
            ctx: socket,
            carrier,
            custom: {
              eventName,
            },
          },
        },
        async () => {
          currentSocket.send(formatResult(payload));
        }
      );
    };

    if (!result) return;
    if (methodMap[propertyName]) {
      for (const wsEventInfo of methodMap[propertyName].responseEvents) {
        if (wsEventInfo.eventType === WSEventTypeEnum.EMIT) {
          await sendWithTrace(socket, result, wsEventInfo.messageEventName);
        } else if (wsEventInfo.eventType === WSEventTypeEnum.BROADCAST) {
          for (const client of this.app.clients) {
            if (client.readyState === WebSocket.OPEN) {
              await sendWithTrace(client, result, propertyName);
            }
          }
        }
      }
      if (methodMap[propertyName].responseEvents.length === 0) {
        // no emit decorator
        await sendWithTrace(socket, result, propertyName);
      }
    } else {
      // just send
      await sendWithTrace(socket, result, propertyName);
    }
  }

  public getFrameworkName() {
    return 'webSocket';
  }

  public useConnectionMiddleware(
    middleware: CommonMiddlewareUnion<Context, NextFunction, undefined>
  ) {
    this.connectionMiddlewareManager.insertLast(middleware);
  }

  public getConnectionMiddleware(): ContextMiddlewareManager<
    Context,
    NextFunction,
    undefined
  > {
    return this.connectionMiddlewareManager;
  }

  public startHeartBeat() {
    this.heartBeatInterval = setInterval(() => {
      this.app.clients.forEach((socket: IMidwayWSContext) => {
        if (socket.isAlive === false) {
          debug('[ws]: socket terminate');
          return socket.terminate();
        }
        socket.isAlive = false;
        socket.ping();
      });
    }, this.configurationOptions.serverHeartbeatInterval);
  }
}

function formatResult(result) {
  return Types.isObject(result) ? JSON.stringify(result) : result;
}
