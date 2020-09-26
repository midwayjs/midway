import { ScopeEnum, saveClassMetadata, saveModule, MS_CONSUMER_KEY } from '../';
import { Scope } from '../annotation';

export enum MSListenerType {
  RABBITMQ = 'rabbitmq',
  MTTQ = 'mttq',
}

export function Consumer(type: MSListenerType): ClassDecorator {
  return (target: any) => {
    saveModule(MS_CONSUMER_KEY, target);
    saveClassMetadata(MS_CONSUMER_KEY, type, target);
    Scope(ScopeEnum.Request)(target);
  };
}
