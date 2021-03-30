import { Scope } from '../annotation';
import {
  ScopeEnum,
  saveModule,
  FUNC_KEY,
  attachClassMetadata,
  MiddlewareParamArray,
  ServerlessTriggerType,
  FaaSMetadata,
} from '..';

export interface FuncParams {
  funHandler?: string;
  event?: string;
  method?: string;
  path?: string;
  middleware?: MiddlewareParamArray;
}

export function Func(type: ServerlessTriggerType.EVENT, metadata?: FaaSMetadata.EventTriggerOptions): MethodDecorator;
export function Func(type: ServerlessTriggerType.HTTP, metadata?: FaaSMetadata.HTTPTriggerMetadata): MethodDecorator;
export function Func(type: ServerlessTriggerType.API_GATEWAY, metadata?: FaaSMetadata.APIGatewayTriggerOptions): MethodDecorator;
export function Func(type: ServerlessTriggerType.OS, metadata?: FaaSMetadata.OSTriggerOptions): MethodDecorator;
export function Func(type: ServerlessTriggerType.LOG, metadata?: FaaSMetadata.LogTriggerOptions): MethodDecorator;
export function Func(type: ServerlessTriggerType.TIMER, metadata?: FaaSMetadata.TimerTriggerOptions): MethodDecorator;
export function Func(type: ServerlessTriggerType.MQ, metadata?: FaaSMetadata.MQTriggerOptions): MethodDecorator;
export function Func(type: string | FuncParams, functionOptions?: FuncParams): any;
export function Func(funHandler: any, functionOptions?: any): any {
  if (typeof funHandler !== 'string' && functionOptions === undefined) {
    functionOptions = funHandler;
    funHandler = functionOptions.funHandler || '';
  }
  return (...args) => {
    const [target, key, descriptor] = args as any;
    if (descriptor) {
      // method decorator
      saveModule(FUNC_KEY, (target as Record<string, unknown>).constructor);
      if (ServerlessTriggerType[funHandler]) {
        // new method decorator
        attachClassMetadata(
          FUNC_KEY,
          {
            type: funHandler,
            methodName: key,
            descriptor,
            ...functionOptions
          },
          target.constructor
        );
      } else {
        // old method decorator
        attachClassMetadata(
          FUNC_KEY,
          {
            funHandler,
            key,
            descriptor,
            ...functionOptions
          },
          target.constructor
        );
      }
    } else {
      // old class decorator
      // save target
      saveModule(FUNC_KEY, target);
      attachClassMetadata(
        FUNC_KEY,
        Object.assign({ funHandler }, functionOptions),
        target
      );
      // register data
      Scope(ScopeEnum.Request)(target);
    }
  };
}
