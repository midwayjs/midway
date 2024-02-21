import {
  Provide,
  saveModule,
  Scope,
  ScopeEnum,
  saveClassMetadata,
} from '@midwayjs/core';
export const MQTT_DECORATOR_KEY = 'rpc:mqtt';

export function MqttSubscriber(subscriberName: string): ClassDecorator {
  return target => {
    saveModule(MQTT_DECORATOR_KEY, target);
    saveClassMetadata(MQTT_DECORATOR_KEY, subscriberName, target);
    Scope(ScopeEnum.Request)(target);
    Provide()(target);
  };
}
