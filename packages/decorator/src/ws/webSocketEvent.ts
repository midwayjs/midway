import { WS_EVENT_KEY, attachClassMetadata } from '../';

export enum WSEventTypeEnum {
  ON_CONNECTION = 'ws:onConnection',
  ON_DISCONNECTION = 'ws:onDisconnection',
  ON_MESSAGE = 'ws:onMessage',
  ON_SOCKET_ERROR = 'ws:onSocketError',
  EMIT = 'ws:Emit',
  BROADCAST = 'ws:broadcast',
}

export interface WSEventInfo {
  /**
   * web socket event name in enum
   */
  eventType: WSEventTypeEnum;
  /**
   * decorator method name
   */
  propertyName: string;
  descriptor: PropertyDescriptor;
  /**
   * the event name by user definition
   */
  messageEventName?: string;
  /**
   * the room name to emit
   */
  roomName?: string[];
}

export function OnConnection(): MethodDecorator {
  return (
    target: object,
    propertyKey: string,
    descriptor: PropertyDescriptor
  ) => {
    attachClassMetadata(
      WS_EVENT_KEY,
      {
        eventType: WSEventTypeEnum.ON_CONNECTION,
        propertyName: propertyKey,
        descriptor,
      },
      target.constructor
    );
  };
}

export function OnDisConnection(): MethodDecorator {
  return (
    target: object,
    propertyKey: string,
    descriptor: PropertyDescriptor
  ) => {
    attachClassMetadata(
      WS_EVENT_KEY,
      {
        eventType: WSEventTypeEnum.ON_DISCONNECTION,
        propertyName: propertyKey,
        descriptor,
      },
      target.constructor
    );
  };
}

export function OnMessage(eventName: string): MethodDecorator {
  return (
    target: object,
    propertyKey: string,
    descriptor: PropertyDescriptor
  ) => {
    attachClassMetadata(
      WS_EVENT_KEY,
      {
        eventType: WSEventTypeEnum.ON_MESSAGE,
        messageEventName: eventName,
        propertyName: propertyKey,
        descriptor,
      },
      target.constructor
    );
  };
}

export function OnSocketError(eventName: string): MethodDecorator {
  return (
    target: object,
    propertyKey: string,
    descriptor: PropertyDescriptor
  ) => {
    attachClassMetadata(
      WS_EVENT_KEY,
      {
        eventType: WSEventTypeEnum.ON_SOCKET_ERROR,
        messageEventName: eventName,
        propertyName: propertyKey,
        descriptor,
      },
      target.constructor
    );
  };
}

export function Emit(
  messageName: string,
  roomName: string | string[] = []
): MethodDecorator {
  return (
    target: object,
    propertyKey: string,
    descriptor: PropertyDescriptor
  ) => {
    attachClassMetadata(
      WS_EVENT_KEY,
      {
        eventType: WSEventTypeEnum.EMIT,
        propertyName: propertyKey,
        messageEventName: messageName,
        roomName: [].concat(roomName),
        descriptor,
      },
      target.constructor
    );
  };
}

export function Broadcast(): MethodDecorator {
  return (
    target: object,
    propertyKey: string,
    descriptor: PropertyDescriptor
  ) => {
    attachClassMetadata(
      WS_EVENT_KEY,
      {
        eventType: WSEventTypeEnum.BROADCAST,
        propertyName: propertyKey,
        descriptor,
      },
      target.constructor
    );
  };
}
