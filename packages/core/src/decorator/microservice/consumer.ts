import {
  saveClassMetadata,
  saveModule,
  MS_CONSUMER_KEY,
  Provide,
  Scope,
} from '../';
import { MSListenerType, ScopeEnum } from '../../interface';

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
    Provide()(target);
  };
}
