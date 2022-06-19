import { createCustomPropertyDecorator } from '@midwayjs/decorator';

export const ENTITY_MODEL_KEY = 'entity_model_key';
export const EVENT_SUBSCRIBER_KEY = 'event_subscriber_key';
export const ORM_MODEL_KEY = '__orm_model_key__';

export function InjectRepository(modelKey: any, connectionName = 'default') {
  return createCustomPropertyDecorator(ORM_MODEL_KEY, {
    modelKey,
    connectionName,
  });
}
