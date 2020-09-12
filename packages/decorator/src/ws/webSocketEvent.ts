import { WS_EVENT_KEY, attachClassMetadata } from '../';

export function OnConnection(): MethodDecorator {
  return (target: object, propertyKey: string, descriptor: PropertyDescriptor) => {
    attachClassMetadata(
      WS_EVENT_KEY,
      {
        eventName: 'onConnection',
        key: propertyKey,
        descriptor,
      },
      target.constructor
    );
  };
}

export function OnDisConnection(): MethodDecorator {
  return (target: object, propertyKey: string, descriptor: PropertyDescriptor) => {
    attachClassMetadata(
      WS_EVENT_KEY,
      {
        eventName: 'onDisConnection',
        key: propertyKey,
        descriptor,
      },
      target.constructor
    );
  };
}

export function OnMessage(messageName: string): MethodDecorator {
  return (target: object, propertyKey: string, descriptor: PropertyDescriptor) => {
    attachClassMetadata(
      WS_EVENT_KEY,
      {
        eventName: 'onMessage',
        messageName,
        key: propertyKey,
        descriptor,
      },
      target.constructor
    );
  };
}

export function Emit(messageName: string): MethodDecorator {
  return (target: object, propertyKey: string, descriptor: PropertyDescriptor) => {
    attachClassMetadata(
      WS_EVENT_KEY,
      {
        eventName: 'onEmit',
        key: propertyKey,
        descriptor,
      },
      target.constructor
    );
  };
}

export function Broadcast(): MethodDecorator {
  return (target: object, propertyKey: string, descriptor: PropertyDescriptor) => {
    attachClassMetadata(
      WS_EVENT_KEY,
      {
        eventName: 'onBroadcast',
        key: propertyKey,
        descriptor,
      },
      target.constructor
    );
  };
}
