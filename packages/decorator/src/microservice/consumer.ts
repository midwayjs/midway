import {
  ScopeEnum,
  saveClassMetadata,
  saveModule,
  MS_CONSUMER_KEY,
  attachClassMetadata,
  MS_CONSUMER_QUEUE_METADATA, ConsumerMetadata, MSListenerType
} from '../';
import { Scope } from '../annotation';
import QueueMethodEnum = ConsumerMetadata.QueueMethodEnum;

export interface RabbitMQListenerOptions {
  exchange?: string;
  exclusive?: boolean;
  durable?: boolean;
  maxPriority?: number;
  prefetch?: number;
  keys?: { [keyName: string]: string };
  routingKey?: string;
  consumeOptions?: {
    consumerTag?: string;
    noLocal?: boolean;
    noAck?: boolean;
    exclusive?: boolean;
    priority?: number;
    arguments?: any;
  };
}

export function Consumer(type: MSListenerType.RABBITMQ, options?: RabbitMQListenerOptions): ClassDecorator;
export function Consumer(type: any, options: any = {}): ClassDecorator {
  return (target: any) => {
    saveModule(MS_CONSUMER_KEY, target);
    saveClassMetadata(MS_CONSUMER_KEY, {
      type,
      metadata: options
    }, target);
    Scope(ScopeEnum.Request)(target);
  };
}

export function QueuePattern(queueNamePattern: string): MethodDecorator {
  return ((target, propertyKey, descriptor) => {
    attachClassMetadata(MS_CONSUMER_QUEUE_METADATA, {
      methodName: propertyKey,
      metadata: {
        pattern: queueNamePattern
      },
      queueMethodName: QueueMethodEnum.QUEUE_PATTERN,
    }, target);
  });
}

export function OnQueueConnect() : MethodDecorator {
  return ((target, propertyKey, descriptor) => {
    attachClassMetadata(MS_CONSUMER_QUEUE_METADATA, {
      methodName: propertyKey,
      metadata: {},
      queueMethodName: QueueMethodEnum.ON_QUEUE_CONNECT,
    }, target);
  });
}


export function OnQueueReconnect(): MethodDecorator {
  return ((target, propertyKey, descriptor) => {
    attachClassMetadata(MS_CONSUMER_QUEUE_METADATA, {
      methodName: propertyKey,
      metadata: {},
      queueMethodName: QueueMethodEnum.ON_QUEUE_RECONNECT,
    }, target);
  });
}

export function OnQueueClose(): MethodDecorator {
  return ((target, propertyKey, descriptor) => {
    attachClassMetadata(MS_CONSUMER_QUEUE_METADATA, {
      methodName: propertyKey,
      metadata: {},
      queueMethodName: QueueMethodEnum.ON_QUEUE_CLOSE,
    }, target);
  });
}

export function OnQueueError(): MethodDecorator {
  return ((target, propertyKey, descriptor) => {
    attachClassMetadata(MS_CONSUMER_QUEUE_METADATA, {
      methodName: propertyKey,
      queueMethodName: QueueMethodEnum.ON_QUEUE_ERROR,
      metadata: {},
    }, target);
  });
}

