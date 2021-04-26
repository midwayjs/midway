import {
  ScopeEnum,
  saveClassMetadata,
  saveModule,
  MS_CONSUMER_KEY,
  attachClassMetadata,
  MS_CONSUMER_QUEUE_METADATA, ConsumerMetadata
} from '../';
import { Scope } from '../annotation';
import QueueMethodEnum = ConsumerMetadata.QueueMethodEnum;

export enum MSListenerType {
  RABBITMQ = 'rabbitmq',
  MTTQ = 'mttq',
  KAFKA = 'kafka',
  REDIS = 'redis',
}

export interface RabbitMQListenerOptions {
  propertyKey?: string;
  queueName?: string;
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
    saveClassMetadata(MS_CONSUMER_KEY, type, target);
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


export function onQueueReconnect(): MethodDecorator {
  return ((target, propertyKey, descriptor) => {
    attachClassMetadata(MS_CONSUMER_QUEUE_METADATA, {
      methodName: propertyKey,
      metadata: {},
      queueMethodName: QueueMethodEnum.ON_QUEUE_RECONNECT,
    }, target);
  });
}

export function onQueueClose(): MethodDecorator {
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

