import {
  Provide,
  Scope,
  ScopeEnum,
  MetadataManager,
  DecoratorManager,
} from '@midwayjs/core';
export const MQTT_DECORATOR_KEY = 'rpc:mqtt';

export function MqttSubscriber(subscriberName: string): ClassDecorator {
  return target => {
    DecoratorManager.saveModule(MQTT_DECORATOR_KEY, target);
    MetadataManager.defineMetadata(MQTT_DECORATOR_KEY, subscriberName, target);
    Scope(ScopeEnum.Request)(target);
    Provide()(target);
  };
}
