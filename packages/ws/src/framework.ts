import {
  BaseFramework,
  HTTP_SERVER_KEY,
  IMidwayBootstrapOptions,
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
  isObject,
  WS_CONTROLLER_KEY,
  WS_EVENT_KEY,
  WSEventInfo,
  WSEventTypeEnum,
  getClassMetadata,
  getProviderId,
  listModule,
} from '@midwayjs/decorator';

export class MidwayWSFramework extends BaseFramework<
  IMidwayWSApplication,
  IMidwayWSContext,
  IMidwayWSConfigurationOptions
> {
  server: http.Server;

  applicationInitialize(options: IMidwayBootstrapOptions) {
    this.configurationOptions.noServer = true;
    const opts = Object.assign({}, this.configurationOptions, { port: null });
    this.app = new WebSocket.Server(opts) as IMidwayWSApplication;
  }
  public app: IMidwayWSApplication;

  protected async afterContainerReady(
    options: Partial<IMidwayBootstrapOptions>
  ): Promise<void> {
    await this.loadMidwayController();
  }

  public async run(): Promise<void> {
    let server: http.Server;
    if (!this.configurationOptions.port) {
      server = this.applicationContext.get(HTTP_SERVER_KEY);
    } else {
      server = this.configurationOptions.server ?? http.createServer();
    }

    server.on('upgrade', (request, socket: any, head) => {
      this.app.handleUpgrade(request, socket, head, ws => {
        this.app.emit('connection', ws, request);
      });
    });

    this.server = server;

    if (this.configurationOptions.port) {
      await new Promise<void>(resolve => {
        server.listen(this.configurationOptions.port, () => {
          this.logger.info(
            `WebSocket server port = ${this.configurationOptions.port} start success`
          );
          resolve();
        });
      });
    }
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

  public getFrameworkType(): MidwayFrameworkType {
    return MidwayFrameworkType.WS;
  }

  private async loadMidwayController() {
    // create room
    const controllerModules = listModule(WS_CONTROLLER_KEY);
    if (controllerModules.length > 0) {
      // ws just one namespace
      await this.addNamespace(
        controllerModules[0],
        getProviderId(controllerModules[0])
      );
    }
  }

  private async addNamespace(target: any, controllerId: string) {
    this.app.on(
      'connection',
      async (socket: IMidwayWSContext, request: http.IncomingMessage) => {
        // create request context
        this.app.createAnonymousContext(socket);
        socket.requestContext.registerObject('socket', socket);
        socket.app = this.app;

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
            const controller = await socket.requestContext.getAsync(
              controllerId
            );
            // on connection
            if (wsEventInfo.eventType === WSEventTypeEnum.ON_CONNECTION) {
              try {
                const result = await controller[wsEventInfo.propertyName].apply(
                  controller,
                  [socket, request]
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
                  const result = await controller[
                    wsEventInfo.propertyName
                  ].apply(controller, args);
                  // emit
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
            } else if (
              wsEventInfo.eventType === WSEventTypeEnum.ON_DISCONNECTION
            ) {
              // on socket disconnect
              socket.on('close', async (reason: string) => {
                try {
                  const result = await controller[
                    wsEventInfo.propertyName
                  ].apply(controller, [reason]);
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

    this.app.on('error', err => {
      this.logger.error('socket server close');
    });

    this.app.on('close', () => {
      this.logger.info('socket server close');
    });
  }

  private async bindSocketResponse(
    result: any,
    socket: IMidwayWSContext,
    propertyName: string,
    methodMap: {
      responseEvents?: WSEventInfo[];
    }
  ) {
    if (!result) return;
    if (methodMap[propertyName]) {
      for (const wsEventInfo of methodMap[propertyName].responseEvents) {
        if (wsEventInfo.eventType === WSEventTypeEnum.EMIT) {
          socket.send(formatResult(result));
        } else if (wsEventInfo.eventType === WSEventTypeEnum.BROADCAST) {
          this.app.clients.forEach(client => {
            if (client.readyState === WebSocket.OPEN) {
              client.send(formatResult(result));
            }
          });
        }
      }
      if (methodMap[propertyName].responseEvents.length === 0) {
        // no emit decorator
        socket.send(formatResult(result));
      }
    } else {
      // just send
      socket.send(formatResult(result));
    }
  }

  public getFrameworkName() {
    return 'midway:ws';
  }
}

function formatResult(result) {
  return isObject(result) ? JSON.stringify(result) : result;
}
