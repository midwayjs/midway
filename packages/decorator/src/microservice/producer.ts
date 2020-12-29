import { ScopeEnum, saveClassMetadata, saveModule, MS_PRODUCER_KEY } from '../';
import { Scope } from '../annotation';

export enum MSProducerType {
  DUBBO = 'dubbo',
  GRPC = 'gRPC',
  HSF = 'hsf',
}

export function Producer(type: MSProducerType): ClassDecorator {
  return (target: any) => {
    saveModule(MS_PRODUCER_KEY, target);
    saveClassMetadata(MS_PRODUCER_KEY, type, target);
    Scope(ScopeEnum.Request)(target);
  };
}
