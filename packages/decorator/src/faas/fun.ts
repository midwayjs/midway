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

export function Func(type: ServerlessTriggerType.EVENT, metadata: FaaSMetadata.EventTriggerOptions): MethodDecorator;
export function Func(type: ServerlessTriggerType.HTTP, metadata: FaaSMetadata.HTTPTriggerMetadata): MethodDecorator;
export function Func(type: ServerlessTriggerType.API_GATEWAY, metadata: FaaSMetadata.APIGatewayTriggerOptions): MethodDecorator;
export function Func(type: ServerlessTriggerType.OS, metadata: FaaSMetadata.OSTriggerOptions): MethodDecorator;
export function Func(type: ServerlessTriggerType.CDN, metadata: FaaSMetadata.CDNTriggerOptions): MethodDecorator;
export function Func(type: ServerlessTriggerType.SLS, metadata: FaaSMetadata.SLSTriggerOptions): MethodDecorator;
export function Func(type: ServerlessTriggerType.TIMER, metadata: FaaSMetadata.TimerTriggerOptions): MethodDecorator;
export function Func(type: ServerlessTriggerType.MQ, metadata: FaaSMetadata.MQTriggerOptions): MethodDecorator;
export function Func(
  funHandler: string | FuncParams,
  functionOptions?: FuncParams
): any {
  if (typeof funHandler !== 'string' && functionOptions === undefined) {
    functionOptions = funHandler;
    funHandler = functionOptions.funHandler || '';
  }
  return (...args) => {
    const [target, key, descriptor] = args as any;
    // If target is function, @Func annotate class
    if (typeof target === 'function') {
      // save target
      saveModule(FUNC_KEY, target);
      attachClassMetadata(
        FUNC_KEY,
        Object.assign({ funHandler }, functionOptions),
        target
      );
      // register data
      Scope(ScopeEnum.Request)(target);
    } else {
      // If target is instance, @Func annotate class member method
      saveModule(FUNC_KEY, (target as Record<string, unknown>).constructor);
      attachClassMetadata(
        FUNC_KEY,
        Object.assign(
          {
            funHandler,
            key,
            descriptor,
          },
          functionOptions
        ),
        target.constructor
      );
    }
  };
}
