import {
  ScopeEnum,
  saveClassMetadata,
  saveModule,
  MS_CONSUMER_KEY,
  attachClassMetadata,
  MS_CONSUMER_QUEUE_METADATA,
  ConsumerMetadata,
  MSListenerType,
} from '../';
import { Scope } from '../annotation';
import QueueMethodEnum = ConsumerMetadata.QueueMethodEnum;

export function Consumer(type: MSListenerType.MQTT): ClassDecorator;
export function Consumer(type: MSListenerType.RABBITMQ, options?: any): ClassDecorator;
export function Consumer(type: any, options: any = {}): ClassDecorator {
  return (target: any) => {
    saveModule(MS_CONSUMER_KEY, target);
    saveClassMetadata(
      MS_CONSUMER_KEY,
      {
        type,
        metadata: options,
      },
      target
    );
    Scope(ScopeEnum.Request)(target);
  };
}

export function ConsumerQueuePattern(
  queueNamePattern: string
): MethodDecorator {
  return (target, propertyKey, descriptor) => {
    attachClassMetadata(
      MS_CONSUMER_QUEUE_METADATA,
      {
        methodName: propertyKey,
        metadata: {
          pattern: queueNamePattern,
        },
        queueMethodName: QueueMethodEnum.QUEUE_PATTERN,
      },
      target
    );
  };
}
