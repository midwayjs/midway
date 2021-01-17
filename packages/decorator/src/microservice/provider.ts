import {
  ScopeEnum,
  saveClassMetadata,
  saveModule,
  MS_PROVIDER_KEY,
  attachClassMetadata,
  MS_GRPC_METHOD_KEY,
  MS_DUBBO_METHOD_KEY,
  MS_HSF_METHOD_KEY,
  MSProviderType,
  DecoratorMetadata,
} from '../';
import { Scope } from '../annotation';

export function Provider(type: MSProviderType.GRPC, metadata?: DecoratorMetadata.GRPCClassMetadata): ClassDecorator;
export function Provider(type: MSProviderType, metadata: any = {}): ClassDecorator {
  return (target: any) => {
    saveModule(MS_PROVIDER_KEY, target);
    saveClassMetadata(MS_PROVIDER_KEY, {
      type,
      metadata,
    }, target);
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
