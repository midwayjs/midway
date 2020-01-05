export interface SCFServerlessSpec {
  service: string;
  provider: Provider;
  plugins: string[];
  package?: Package;
  functions: Functions;
}

export interface Functions {
  [key: string]: SCFServerlessFunctionSpec;
}

export interface SCFServerlessFunctionSpec {
  handler: string;
  description: string;
  runtime: string;
  memorySize: number;
  timeout: number;
  environment: FunctionEnvironment;
  vpcConfig?: VpcConfig;
  events: Event[];
}

export interface FunctionEnvironment {
  variables: { [key: string]: string };
}

export interface Event {
  timer?: Timer;
  cos?: Cos;
  apigw?: ApiGateway;
  cmq?: Cmq;
  ckafka?: Ckafka;
}

export interface ApiGateway {
  name: string;
  parameters: ApiGatewayParameters;
}

export interface ApiGatewayParameters {
  stageName: string;
  serviceId: null;
  httpMethod: SCFHTTPMethod;
  integratedResponse: boolean;
  path: string;
  enableCORS?: boolean;
  serviceTimeout: number;
}

export interface Ckafka {
  name: string;
  parameters: CkafkaParameters;
}

export interface CkafkaParameters {
  name: string;
  topic: string;
  maxMsgNum: number;
  offset: string;
  enable: boolean;
}

export interface Cmq {
  name: string;
  parameters: CmqParameters;
}

export interface CmqParameters {
  name: string;
  enable: boolean;
}

export interface Cos {
  name: string;
  parameters: CosParameters;
}

export interface CosParameters {
  bucket: string;
  filter: Filter;
  events: string;
  enable: boolean;
}

export interface Filter {
  prefix: string;
  suffix: string;
}

export interface Timer {
  name: string;
  parameters: TimerParameters;
}

export interface TimerParameters {
  cronExpression: string;
  enable: boolean;
}

export interface VpcConfig {
  vpcId: string;
  subnetId: string;
}

export interface Package {
  include: string[];
  exclude: string[];
}

export interface Provider {
  name: string;
  runtime: string;
  credentials: string;
  stage?: string;
  cosBucket?: string;
  role?: string;
  memorySize?: number;
  timeout?: number;
  region?: string;
  environment?: ProviderEnvironment;
  vpcConfig?: VpcConfig;
}

export interface ProviderEnvironment {
  variables: { [key: string]: string };
}

export type SCFHTTPMethod = 'ANY' | 'GET' | 'POST' | 'PUT' | 'DELETE' | 'HEAD';
