import {
  ScopeEnum,
  saveClassMetadata,
  saveModule,
  MS_PRODUCER_KEY,
  attachClassMetadata,
  MS_GRPC_METHOD_KEY,
  MS_DUBBO_METHOD_KEY,
  MS_HSF_METHOD_KEY,
} from '../';
import { Scope } from '../annotation';

export enum MSProviderType {
  DUBBO = 'dubbo',
  GRPC = 'gRPC',
  HSF = 'hsf',
}

export function Provider(type: MSProviderType): ClassDecorator {
  return (target: any) => {
    saveModule(MS_PRODUCER_KEY, target);
    saveClassMetadata(MS_PRODUCER_KEY, type, target);
    Scope(ScopeEnum.Request)(target);
  };
}

export function GrpcMethod(methodName?: string): MethodDecorator  {
  return (target, propertyName, descriptor: PropertyDescriptor) => {
    attachClassMetadata(
      MS_GRPC_METHOD_KEY,
      {
        methodName: methodName || propertyName
      },
      target
    );

    return descriptor;
  };
}

export function DubboMethod(methodName?: string): MethodDecorator  {
  return (target, propertyName, descriptor: PropertyDescriptor) => {
    attachClassMetadata(
      MS_DUBBO_METHOD_KEY,
      {
        methodName: methodName || propertyName
      },
      target
    );

    return descriptor;
  };
}

export function HSFMethod(methodName?: string): MethodDecorator  {
  return (target, propertyName, descriptor: PropertyDescriptor) => {
    attachClassMetadata(
      MS_HSF_METHOD_KEY,
      {
        methodName: methodName || propertyName
      },
      target
    );

    return descriptor;
  };
}
