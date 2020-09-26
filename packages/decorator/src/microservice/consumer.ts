import { ScopeEnum, saveClassMetadata, saveModule, MS_CONSUMER_KEY } from '../';
import { Scope } from '../annotation';

export interface ConsumerOptions {
}

export function Consumer(name: string, options?: ConsumerOptions): ClassDecorator {
  return (target: any) => {
    saveModule(MS_CONSUMER_KEY, target);
    saveClassMetadata(MS_CONSUMER_KEY, {
      queueName: name,
      consumerOptions: options
    }, target);
    Scope(ScopeEnum.Request)(target);
  };
}
