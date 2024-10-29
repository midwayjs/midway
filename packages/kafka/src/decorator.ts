import {
  Provide,
  saveModule,
  Scope,
  ScopeEnum,
  saveClassMetadata,
} from '@midwayjs/core';
export const KAFKA_DECORATOR_KEY = 'rpc:kafka';

export function KafkaSubscriber(subscriberName: string): ClassDecorator {
  return target => {
    saveModule(KAFKA_DECORATOR_KEY, target);
    saveClassMetadata(KAFKA_DECORATOR_KEY, subscriberName, target);
    Scope(ScopeEnum.Request)(target);
    Provide()(target);
  };
}
