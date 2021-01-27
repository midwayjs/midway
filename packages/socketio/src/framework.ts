import {
  BaseFramework,
  getClassMetadata,
  getProviderId,
  IMidwayBootstrapOptions,
  listModule,
  MidwayFrameworkType,
} from '@midwayjs/core';

import {
  IMidwaySocketIOApplication,
  IMidwaySocketIOConfigurationOptions,
  IMidwaySocketIOContext,
} from './interface';
import * as SocketIO from 'socket.io';
import {
  WS_CONTROLLER_KEY,
  WS_EVENT_KEY,
  WSControllerOption,
  WSEventInfo,
  WSEventTypeEnum,
} from '@midwayjs/decorator';
import { MidwaySocketIOContextLogger } from './logger';

export class MidwaySocketIOFramework extends BaseFramework<
  IMidwaySocketIOApplication,
  IMidwaySocketIOContext,
  IMidwaySocketIOConfigurationOptions
> {
  applicationInitialize(options: IMidwayBootstrapOptions) {}
  public app: IMidwaySocketIOApplication;

  protected async afterContainerDirectoryLoad(
    options: Partial<IMidwayBootstrapOptions>
  ) {
    if (this.configurationOptions.webServer) {
      this.app = (SocketIO(
        this.configurationOptions.webServer,
        this.configurationOptions
      ) as unknown) as IMidwaySocketIOApplication;
    } else {
      this.app = (SocketIO(
        this.configurationOptions
      ) as unknown) as IMidwaySocketIOApplication;
    }

    this.app.use((socket, next) => {
      this.app.createAnonymousContext(socket);
      socket.requestContext.registerObject('socket', socket);
      next();
    });
  }

  protected async afterContainerReady(
    options: Partial<IMidwayBootstrapOptions>
  ): Promise<void> {
    await this.loadMidwayController();
  }

  public async run(): Promise<void> {
    if (this.configurationOptions.port) {
      // if set httpServer will be listen in web framework
      if (!this.configurationOptions.webServer) {
        new Promise(resolve => {
          this.app.listen(
            this.configurationOptions.port,
            this.configurationOptions
          );
        });
      }
    }
  }

  protected async beforeStop(): Promise<void> {
    return new Promise<void>(resolve => {
      this.app.close(() => {
        resolve();
      });
    });
  }

  public getFrameworkType(): MidwayFrameworkType {
    return MidwayFrameworkType.WS_IO;
  }

  public getApplication(): IMidwaySocketIOApplication {
    return this.app;
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

    nsp.on('connect', async (socket: IMidwaySocketIOContext) => {
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
            const result = await controller[
              wsEventInfo.propertyName
            ].apply(controller, [socket]);
            await this.bindSocketResponse(
              result,
              socket,
              wsEventInfo.propertyName,
              methodMap
            );
          } else if (wsEventInfo.eventType === WSEventTypeEnum.ON_MESSAGE) {
            // on user custom event
            socket.on(wsEventInfo.messageEventName, async (...args) => {
              // eslint-disable-next-line prefer-spread
              const result = await controller[wsEventInfo.propertyName].apply(
                controller,
                args
              );
              await this.bindSocketResponse(
                result,
                socket,
                wsEventInfo.propertyName,
                methodMap
              );
            });
          } else if (
            wsEventInfo.eventType === WSEventTypeEnum.ON_DISCONNECTION
          ) {
            // on socket disconnect
            socket.on('disconnect', async (reason: string) => {
              const result = await controller[
                wsEventInfo.propertyName
              ].apply(controller, [reason]);
              await this.bindSocketResponse(
                result,
                socket,
                wsEventInfo.propertyName,
                methodMap
              );
            });
          } else if (
            wsEventInfo.eventType === WSEventTypeEnum.ON_SOCKET_ERROR
          ) {
            // on socket error
            socket.on('error', async err => {
              const result = await controller[
                wsEventInfo.propertyName
              ].apply(controller, [err]);
              await this.bindSocketResponse(
                result,
                socket,
                wsEventInfo.propertyName,
                methodMap
              );
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
    return 'midway:socketIO';
  }

  public getDefaultContextLoggerClass(): any {
    return MidwaySocketIOContextLogger;
  }
}
