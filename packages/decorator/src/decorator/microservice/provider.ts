import {
  ScopeEnum,
  saveClassMetadata,
  saveModule,
  MS_PROVIDER_KEY,
  attachClassMetadata,
  savePropertyMetadata,
  MS_GRPC_METHOD_KEY,
  MS_DUBBO_METHOD_KEY,
  MS_HSF_METHOD_KEY,
  MSProviderType,
  GRPCMetadata,
} from '../../';
import { Scope } from '../objectDef';

export function Provider(
  type: MSProviderType.GRPC,
  metadata?: GRPCMetadata.ProviderOptions
): ClassDecorator;
export function Provider(
  type: MSProviderType.DUBBO,
  metadata?: any
): ClassDecorator;
export function Provider(
  type: MSProviderType,
  metadata: any = {}
): ClassDecorator {
  return (target: any) => {
    saveModule(MS_PROVIDER_KEY, target);
    saveClassMetadata(
      MS_PROVIDER_KEY,
      {
        type,
        metadata,
      },
      target
    );
    Scope(ScopeEnum.Request)(target);
  };
}

export enum GrpcStreamTypeEnum {
  BASE = 'base',
  DUPLEX = 'ServerDuplexStream',
  READABLE = 'ServerReadableStream',
  WRITEABLE = 'ServerWritableStream',
}

export function GrpcMethod(
  methodOptions: {
    methodName?: string;
    type?: GrpcStreamTypeEnum;
    onEnd?: string;
  } = {}
): MethodDecorator {
  return (target, propertyName, descriptor: PropertyDescriptor) => {
    if (!methodOptions.type) {
      methodOptions.type = GrpcStreamTypeEnum.BASE;
    }
    savePropertyMetadata(
      MS_GRPC_METHOD_KEY,
      {
        methodName: methodOptions.methodName || propertyName,
        type: methodOptions.type,
        onEnd: methodOptions.onEnd,
      },
      target,
      propertyName
    );

    return descriptor;
  };
}

export function DubboMethod(methodName?: string): MethodDecorator {
  return (target, propertyName, descriptor: PropertyDescriptor) => {
    attachClassMetadata(
      MS_DUBBO_METHOD_KEY,
      {
        methodName: methodName || propertyName,
      },
      target
    );

    return descriptor;
  };
}

export function HSFMethod(methodName?: string): MethodDecorator {
  return (target, propertyName, descriptor: PropertyDescriptor) => {
    attachClassMetadata(
      MS_HSF_METHOD_KEY,
      {
        methodName: methodName || propertyName,
      },
      target
    );

    return descriptor;
  };
}
