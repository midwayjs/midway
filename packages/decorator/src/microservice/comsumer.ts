import { ScopeEnum, saveClassMetadata, saveModule, MS_COMSUMER_KEY } from '../';
import { Scope } from '../annotation';

export interface ComsumerOptions {
}

export function Comsumer(name: string, options?: ComsumerOptions): ClassDecorator {
  return (target: any) => {
    saveModule(MS_COMSUMER_KEY, target);
    saveClassMetadata(MS_COMSUMER_KEY, {
      queueName: name,
      comsumerOptions: options
    }, target);
    Scope(ScopeEnum.Request)(target);
  };
}
