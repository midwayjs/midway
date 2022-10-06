import {
  BaseFramework,
  CommonMiddlewareUnion,
  ContextMiddlewareManager,
  HTTP_SERVER_KEY,
  MidwayFrameworkType,
  MidwayInvokeForbiddenError,
} from '@midwayjs/core';
import { debuglog } from 'util';
const debug = debuglog('midway:socket.io');

import {
  Application,
  IMidwaySocketIOOptions,
  Context,
  NextFunction,
} from './interface';
import { Server } from 'socket.io';
import {
  WS_CONTROLLER_KEY,
  WS_EVENT_KEY,
  WSControllerOption,
  WSEventInfo,
  WSEventTypeEnum,
  getClassMetadata,
  listModule,
  Framework,
} from '@midwayjs/core';

@Framework()
export class MidwaySocketIOFramework extends BaseFramework<
  Application,
  Context,
  IMidwaySocketIOOptions
> {
  private namespaceList = [];
  public app: Application;
  protected connectionMiddlewareManager = this.createMiddlewareManager();

  configure(): IMidwaySocketIOOptions {
    return this.configService.getConfiguration('socketIO');
  }

  applicationInitialize() {
    this.app = new Server(this.configurationOptions) as Application;
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
    });
  }

  public async run(): Promise<void> {
    await this.loadMidwayController();
    if (this.configurationOptions.adapter) {
      this.app.adapter(this.configurationOptions.adapter);
      this.logger.debug('[midway:socketio] init socket.io-redis ready!');
    }

    // listen port when http server not exist
    if (this.configurationOptions.port) {
      this.app.listen(
        this.configurationOptions.port,
        this.configurationOptions
      );
      this.logger.info(
        `[midway:socketio] Socket.io server port = ${this.configurationOptions.port} start success`
      );
    } else if (this.applicationContext.hasObject(HTTP_SERVER_KEY)) {
      this.app.attach(
        this.applicationContext.get(HTTP_SERVER_KEY),
        this.configurationOptions
      );
      this.logger.info(
        '[midway:socketio] Socket.io server start success and attach to web server'
      );
    }
  }

  protected async beforeStop(): Promise<void> {
    return new Promise<void>(resolve => {
      this.app.close(() => {
        setTimeout(() => {
          resolve();
        }, 1000);
      });
    });
  }

  public getFrameworkType(): MidwayFrameworkType {
    return MidwayFrameworkType.WS_IO;
  }

  private async loadMidwayController() {
    // create room
    const controllerModules = listModule(WS_CONTROLLER_KEY);
    for (const module of controllerModules) {
      await this.addNamespace(module);
    }
  }

  private async addNamespace(target: any) {
    const controllerOption: WSControllerOption = getClassMetadata(
      WS_CONTROLLER_KEY,
      target
    );

    const nsp = this.app.of(controllerOption.namespace);
    this.namespaceList.push(controllerOption.namespace);
    const controllerMiddleware =
      controllerOption.routerOptions.middleware ?? [];
    const controllerConnectionMiddleware =
      controllerOption.routerOptions.connectionMiddleware ?? [];

    nsp.use((socket: any, next) => {
      this.app.createAnonymousContext(socket);
      socket.requestContext.registerObject('socket', socket);
      socket.app = this.app;
      next();
    });

    nsp.on('connect', async (socket: Context) => {
      // run connection middleware
      const connectFn = await this.middlewareService.compose(
        [
          ...this.connectionMiddlewareManager,
          ...controllerConnectionMiddleware,
        ],
        this.app
      );
      await connectFn(socket);

      const wsEventInfos: WSEventInfo[] = getClassMetadata(
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
              const fn = await this.middlewareService.compose(
                [
                  ...(wsEventInfo?.eventOptions?.middleware || []),
                  async (ctx, next) => {
                    // eslint-disable-next-line prefer-spread
                    return controller[wsEventInfo.propertyName].apply(
                      controller,
                      [socket]
                    );
                  },
                ],
                this.app
              );
              const result = await fn(socket);

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
              debug('got message', wsEventInfo.messageEventName, args);

              try {
                const result = await (
                  await this.applyMiddleware(async (ctx, next) => {
                    // add controller middleware
                    const fn = await this.middlewareService.compose(
                      [
                        ...controllerMiddleware,
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
                          // eslint-disable-next-line prefer-spread
                          return controller[wsEventInfo.propertyName].apply(
                            controller,
                            args
                          );
                        },
                      ],
                      this.app
                    );
                    return await fn(ctx, next);
                  })
                )(socket);
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
            socket.on('disconnect', async (reason: string) => {
              try {
                const result = await controller[wsEventInfo.propertyName].apply(
                  controller,
                  [reason]
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
    });

    if (nsp.adapter) {
      nsp.adapter.on('error', err => {
        this.logger.error(err);
      });
    }
  }

  private async bindSocketResponse(
    result: any,
    socket: Context,
    propertyName: string,
    methodMap: {
      responseEvents?: WSEventInfo[];
    }
  ) {
    if (result && methodMap[propertyName]) {
      for (const wsEventInfo of methodMap[propertyName].responseEvents) {
        if (wsEventInfo.eventType === WSEventTypeEnum.EMIT) {
          if (wsEventInfo.roomName.length) {
            socket = wsEventInfo.roomName.reduce((socket, name) => {
              return socket.to(name);
            }, socket);
          }
          // eslint-disable-next-line prefer-spread
          socket.emit.apply(
            socket,
            [wsEventInfo.messageEventName].concat(result)
          );
        } else if (wsEventInfo.eventType === WSEventTypeEnum.BROADCAST) {
          // eslint-disable-next-line prefer-spread
          socket.nsp.emit.apply(socket.nsp, [].concat(result));
        }
      }
    }
  }

  public getFrameworkName() {
    return 'midway:socketIO';
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
}
