import {
  BaseFramework,
  getClassMetadata,
  getProviderId,
  HTTP_SERVER_KEY,
  IMidwayBootstrapOptions,
  listModule,
  MidwayFrameworkType,
} from '@midwayjs/core';
import * as http from 'http';
import { debuglog } from 'util';
const debug = debuglog('midway:ws');

import {
  IMidwayWSApplication,
  IMidwayWSConfigurationOptions,
  IMidwayWSContext,
} from './interface';
import * as WebSocket from 'ws';
import {
  WS_CONTROLLER_KEY,
  WS_EVENT_KEY,
  WSControllerOption,
  WSEventInfo,
  WSEventTypeEnum,
} from '@midwayjs/decorator';

export class MidwaySocketIOFramework extends BaseFramework<
  IMidwayWSApplication,
  IMidwayWSContext,
  IMidwayWSConfigurationOptions
> {
  private namespaceList = [];

  applicationInitialize(options: IMidwayBootstrapOptions) {
    this.configurationOptions.noServer = false;
    this.app = new WebSocket.Server(this.configurationOptions) as IMidwayWSApplication;
  }
  public app: IMidwayWSApplication;

  protected async afterContainerReady(
    options: Partial<IMidwayBootstrapOptions>
  ): Promise<void> {
    await this.loadMidwayController();
  }

  public async run(): Promise<void> {
    let server: http.Server = this.applicationContext.get(HTTP_SERVER_KEY);
    if (!server) {
      server = http.createServer();
    }

    server.on('upgrade', (request, socket, head) => {
      this.app.handleUpgrade(request, socket, head, (ws) => {
        this.app.emit('connection', ws, request);
      });
    });

    await new Promise<void>(resolve => {
      server.listen(this.configurationOptions.port, () => {
        this.logger.info(
          `WebSocket server port = ${this.configurationOptions.port} start success`
        );
        resolve();
      });
    });
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
    return MidwayFrameworkType.WSS;
  }

  private async loadMidwayController() {
    // create room
    const controllerModules = listModule(WS_CONTROLLER_KEY);
    for (const module of controllerModules) {
      const providerId = getProviderId(module);
      if (providerId) {
        await this.addNamespace(module, providerId);
      }
    }
  }

  private async addNamespace(target: any, controllerId: string) {
    const controllerOption: WSControllerOption = getClassMetadata(
      WS_CONTROLLER_KEY,
      target
    );

    const nsp = this.app.of(controllerOption.namespace);
    this.namespaceList.push(controllerOption.namespace);

    nsp.use((socket: any, next) => {
      this.app.createAnonymousContext(socket);
      socket.requestContext.registerObject('socket', socket);
      socket.app = this.app;
      next();
    });

    nsp.on('connect', async (socket: IMidwayWSContext) => {
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
          const controller = await socket.requestContext.getAsync(controllerId);
          // on connection
          if (wsEventInfo.eventType === WSEventTypeEnum.ON_CONNECTION) {
            try {
              const result = await controller[wsEventInfo.propertyName].apply(
                controller,
                [socket]
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
              debug('got message', wsEventInfo.messageEventName, args);
              try {
                // eslint-disable-next-line prefer-spread
                const result = await controller[wsEventInfo.propertyName].apply(
                  controller,
                  args
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
              } catch (err) {
                this.logger.error(err);
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
    socket: IMidwaySocketIOContext,
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
    return 'midway:ws';
  }
}
