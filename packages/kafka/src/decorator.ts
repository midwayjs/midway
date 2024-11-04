import {
  Provide,
  saveModule,
  Scope,
  ScopeEnum,
  saveClassMetadata,
} from '@midwayjs/core';
export const KAFKA_DECORATOR_KEY = 'rpc:kafka';

export function KafkaConsumer(consumerName: string): ClassDecorator {
  return target => {
    saveModule(KAFKA_DECORATOR_KEY, target);
    saveClassMetadata(KAFKA_DECORATOR_KEY, consumerName, target);
    Scope(ScopeEnum.Request)(target);
    Provide()(target);
  };
}
