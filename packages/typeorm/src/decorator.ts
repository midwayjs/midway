import {
  createCustomPropertyDecorator,
  Provide,
  Scope,
  ScopeEnum,
} from '@midwayjs/decorator';
import { EventSubscriber } from 'typeorm';

export const ENTITY_MODEL_KEY = 'entity_model_key';
export const EVENT_SUBSCRIBER_KEY = 'event_subscriber_key';
export const ORM_MODEL_KEY = '__orm_model_key__';

export function InjectEntityModel(modelKey: any, connectionName = 'default') {
  return createCustomPropertyDecorator(ORM_MODEL_KEY, {
    modelKey,
    connectionName,
  });
}

/**
 * EventSubscriber - typeorm
 * implements EntitySubscriberInterface
 */
export function EventSubscriberModel(): ClassDecorator {
  return function (target) {
    Provide()(target);
    Scope(ScopeEnum.Singleton)(target);
    EventSubscriber()(target);
  };
}
