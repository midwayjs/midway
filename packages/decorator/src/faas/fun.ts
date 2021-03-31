import { Scope } from '../annotation';
import {
  attachClassMetadata,
  FaaSMetadata,
  FUNC_KEY,
  getProviderId,
  MiddlewareParamArray,
  saveModule,
  ScopeEnum,
  ServerlessTriggerType,
} from '..';
import EventTriggerUnionOptions = FaaSMetadata.EventTriggerUnionOptions;

export interface FuncParams {
  funHandler?: string;
  event?: string;
  method?: string;
  path?: string;
  middleware?: MiddlewareParamArray;
}

/**
 * @deprecated Please upgrade to midway serverless v2.0 and use ServerlessTriggerType
 * @example '@Func(ServerlessTriggerType.HTTP, { path: '/'})'
 */
export function Func(
  funHandler: string | FuncParams,
  functionOptions?: FuncParams
): any;
export function Func(funHandler: any, functionOptions?: any): any {
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

export function ServerlessTrigger(
  type: ServerlessTriggerType.HTTP,
  metadata: FaaSMetadata.HTTPTriggerOptions
): MethodDecorator;
export function ServerlessTrigger(
  type: ServerlessTriggerType.API_GATEWAY,
  metadata?: FaaSMetadata.APIGatewayTriggerOptions
): MethodDecorator;
export function ServerlessTrigger(
  type: ServerlessTriggerType.OS,
  metadata: FaaSMetadata.OSTriggerOptions
): MethodDecorator;
export function ServerlessTrigger(
  type: ServerlessTriggerType.LOG,
  metadata: FaaSMetadata.LogTriggerOptions
): MethodDecorator;
export function ServerlessTrigger(
  type: ServerlessTriggerType.TIMER,
  metadata: FaaSMetadata.TimerTriggerOptions
): MethodDecorator;
export function ServerlessTrigger(
  type: ServerlessTriggerType.MQ,
  metadata: FaaSMetadata.MQTriggerOptions
): MethodDecorator;
export function ServerlessTrigger(
  type: ServerlessTriggerType.CDN
): MethodDecorator;
export function ServerlessTrigger(
  type: ServerlessTriggerType.HSF
): MethodDecorator;
export function ServerlessTrigger(
  type: ServerlessTriggerType.MTOP
): MethodDecorator;
export function ServerlessTrigger(
  type: ServerlessTriggerType.EVENT
): MethodDecorator;
export function ServerlessTrigger(
  type: ServerlessTriggerType,
  metadata: EventTriggerUnionOptions = {}
): MethodDecorator {
  return (target, functionName: string, descriptor) => {
    if (
      type === ServerlessTriggerType.HTTP ||
      type === ServerlessTriggerType.API_GATEWAY
    ) {
      metadata['method'] = metadata['method'] ?? 'get';
    }
    metadata['functionName'] =
      metadata['functionName'] ??
      getProviderId(target.constructor).replace(/[:#]/g, '_') +
        '_' +
        functionName;
    saveModule(FUNC_KEY, target.constructor);
    // new method decorator
    metadata = metadata || {};
    attachClassMetadata(
      FUNC_KEY,
      {
        type,
        methodName: functionName,
        functionName: metadata.functionName,
        metadata,
      },
      target.constructor
    );
  };
}
