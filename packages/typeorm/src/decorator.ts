import {
  createCustomPropertyDecorator,
  Provide,
  Scope,
  ScopeEnum,
} from '@midwayjs/core';
import { EntityTarget, EventSubscriber } from 'typeorm';

export const ENTITY_MODEL_KEY = 'typeorm:entity_model_key';
export const EVENT_SUBSCRIBER_KEY = 'typeorm:event_subscriber_key';
export const ORM_MODEL_KEY = 'typeorm:orm_model_key';
export const ORM_DATA_SOURCE_KEY = 'typeorm:data_source_key';

export function InjectEntityModel(
  modelKey: EntityTarget<unknown>,
  connectionName?: string
) {
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

export function InjectDataSource(dataSourceName?: string) {
  return createCustomPropertyDecorator(ORM_DATA_SOURCE_KEY, {
    dataSourceName,
  });
}
