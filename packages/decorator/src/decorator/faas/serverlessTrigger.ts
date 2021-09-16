import {
  attachClassMetadata,
  savePropertyMetadata,
  FaaSMetadata,
  FUNC_KEY,
  SERVERLESS_FUNC_KEY,
  saveModule,
  ServerlessTriggerType,
} from '../../';

export function ServerlessFunction(
  options: FaaSMetadata.ServerlessFunctionOptions
): MethodDecorator {
  return (target, key, descriptor) => {
    savePropertyMetadata(SERVERLESS_FUNC_KEY, options, target, key);
  };
}

export function ServerlessTrigger(
  type: ServerlessTriggerType.HTTP,
  metadata: FaaSMetadata.HTTPTriggerOptions
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
  type: ServerlessTriggerType.CDN,
  metadata?: FaaSMetadata.CDNTriggerOptions
): MethodDecorator;
export function ServerlessTrigger(
  type: ServerlessTriggerType.API_GATEWAY,
  metadata?: FaaSMetadata.APIGatewayTriggerOptions
): MethodDecorator;
export function ServerlessTrigger(
  type: ServerlessTriggerType.HSF,
  metadata?: FaaSMetadata.HSFTriggerOptions
): MethodDecorator;
export function ServerlessTrigger(
  type: ServerlessTriggerType.MTOP,
  metadata?: FaaSMetadata.MTopTriggerOptions
): MethodDecorator;
export function ServerlessTrigger(
  type: ServerlessTriggerType.EVENT,
  metadata?: FaaSMetadata.EventTriggerOptions
): MethodDecorator;
export function ServerlessTrigger(
  type: any,
  metadata: any = {}
): MethodDecorator {
  return (target, functionName: string, descriptor) => {
    if (
      type === ServerlessTriggerType.HTTP ||
      type === ServerlessTriggerType.API_GATEWAY
    ) {
      metadata['method'] = metadata['method'] ?? 'get';
    }
    saveModule(FUNC_KEY, target.constructor);
    // new method decorator
    metadata = metadata || {};
    attachClassMetadata(
      FUNC_KEY,
      {
        type,
        methodName: functionName,
        metadata,
      },
      target.constructor
    );
  };
}
