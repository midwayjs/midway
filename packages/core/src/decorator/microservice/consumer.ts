import { MS_CONSUMER_KEY, Provide, Scope, DecoratorManager } from '../';
import { MSListenerType, ScopeEnum } from '../../interface';
import { MetadataManager } from '../metadataManager';

export function Consumer(type: MSListenerType.MQTT): ClassDecorator;
export function Consumer(
  type: MSListenerType.RABBITMQ,
  options?: any
): ClassDecorator;
export function Consumer(
  type: MSListenerType.KAFKA,
  options?: any
): ClassDecorator;
export function Consumer(type: any, options: any = {}): ClassDecorator {
  return (target: any) => {
    DecoratorManager.saveModule(MS_CONSUMER_KEY, target);
    MetadataManager.defineMetadata(
      MS_CONSUMER_KEY,
      {
        type,
        metadata: options,
      },
      target
    );
    Scope(ScopeEnum.Request)(target);
    Provide()(target);
  };
}
