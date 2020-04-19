import {
  PackageStructure,
  LayersStructure,
  PluginsStructure,
  AggregationStructure,
} from '../interface';

export interface SCFServerlessStructure {
  service: string;
  provider: SCFProviderStructure;
  functions: SCFFunctionsStructure;
  plugins: PluginsStructure;
  package: PackageStructure;
  layers: LayersStructure;
  aggregation: AggregationStructure;
}

export interface SCFProviderStructure {
  name: string;
  runtime: string;
  credentials: string;
  stage?: string;
  cosBucket?: string;
  role?: string;
  memorySize?: number;
  timeout?: number;
  region?: string;
  environment?: EnvironmentSpec;
  vpcConfig?: VpcConfig;
}

export interface SCFFunctionsStructure {
  [key: string]: SCFFunctionStructure;
}

export interface SCFFunctionStructure {
  handler: string;
  description: string;
  runtime: string;
  memorySize: number;
  timeout: number;
  environment?: EnvironmentSpec;
  vpcConfig?: VpcConfig;
  events: Array<{
    [eventName: string]: SCFEventType;
  }>;
}

export interface EnvironmentSpec {
  variables: { [key: string]: string };
}

export type SCFEventType =
  | SCFAPIGatewayEvent
  | SCFCKafkaEvent
  | SCFCMQEvent
  | SCFCOSEvent
  | SCFTimerEvent;

export interface SCFAPIGatewayEvent {
  name: string;
  parameters: {
    stageName?: string;
    serviceId?: string;
    httpMethod?: SCFHTTPMethod;
    integratedResponse?: boolean;
    path: string;
    enableCORS?: boolean;
    serviceTimeout?: number;
  };
}

export interface SCFCKafkaEvent {
  name: string;
  parameters: {
    name: string;
    topic: string;
    maxMsgNum: number;
    offset: string;
    enable: boolean;
  };
}

export interface SCFCMQEvent {
  name: string;
  parameters: {
    name: string;
    enable: boolean;
  };
}

export interface SCFCOSEvent {
  name: string;
  parameters: {
    bucket: string;
    filter: {
      prefix: string;
      suffix: string;
    };
    events: string;
    enable: boolean;
  };
}

export interface SCFTimerEvent {
  name: string;
  parameters: {
    cronExpression: string;
    enable: boolean;
  };
}

export interface VpcConfig {
  vpcId: string;
  subnetId: string;
}

export interface Package {
  include: string[];
  exclude: string[];
}

export type SCFHTTPMethod = 'ANY' | 'GET' | 'POST' | 'PUT' | 'DELETE' | 'HEAD';
