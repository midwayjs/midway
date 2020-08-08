export type SpecTransformer = (builder: Builder) => string;

export interface ProviderStructure {
  name?: string;
  runtime?: string;
  stage?: string;
  region?: string;
  timeout?: number;
  memorySize?: number;
  description?: string;
  role?: string;
  environment?: {
    [key: string]: string;
  };
  serviceId?: string;
}

export interface FunctionsStructure {
  [functionName: string]: FunctionStructure;
}

export type EventTypeKey = 'http' | 'timer' | 'os' | 'log' | 'apigw' | 'mq';

export type EventType =
  | HTTPEvent
  | TimerEvent
  | LogEvent
  | OSEvent
  | APIGatewayEvent;

export interface EventStructureType {
  [eventType: string]: EventType;
}

export interface HTTPEvent {
  name?: string;
  path?: string;
  method?: string | string[];
  role?: string;
  version?: string;
  serviceId?: string;
  cors?: boolean;
  timeout?: number;
  integratedResponse?: boolean;
}

// 定时任务
export interface TimerEvent {
  name?: string;
  type?: 'cron' | 'every' | 'interval';
  value: string;
  payload?: string;
  version?: string;
  enable?: boolean;
}

// 日志
export interface LogEvent {
  name?: string;
  source: string;
  project: string;
  log: string;
  retryTime?: number;
  interval?: number;
  role?: string;
  version?: string;
}

// 对象存储
export interface OSEvent {
  name?: string;
  bucket: string;
  events: string;
  filter: {
    prefix: string;
    suffix: string;
  };
  enable?: boolean;
  role?: string;
  version?: string;
}

export interface MQEvent {
  name?: string;
  topic: string;
  tags?: string;
  region?: string;
  strategy?: string;
  role?: string;
  version?: string;
  enable?: boolean;
}

// API 网关
export type APIGatewayEvent = HTTPEvent;

export interface FunctionStructure {
  handler: string;
  name?: string;
  description?: string;
  memorySize?: number;
  timeout?: number;
  runtime?: string;
  initTimeout?: number;
  environment?: {
    [key: string]: string;
  };
  events?: EventStructureType[];
  concurrency?: number;
  stage?: string;
}

export interface LayersStructure {
  [layerName: string]: {
    path: string;
    name?: string;
  };
}

// eslint-disable-next-line @typescript-eslint/no-empty-interface
export interface ResourcesStructure {}

export interface ServiceStructure {
  name?: string;
  description?: string;
}

export interface AggregationStructure {
  [aggregationName: string]: {
    deployOrigin?: boolean;
    functions?: string[];
    functionsPattern?: string[];
  };
}

export type PluginsStructure = string[];

export interface PackageStructure {
  artifact?: string;
  include?: string[];
  exclude?: string[];
}

export interface FunctionsRuleItem {
  baseDir: string;
  events?: {
    http: {
      basePath: string;
    };
  }[];
}

export interface SpecStructure {
  service?: ServiceStructure;
  provider?: ProviderStructure;
  functions?: FunctionsStructure;
  aggregation?: AggregationStructure;
  layers?: LayersStructure;
  plugins?: PluginsStructure;
  package?: PackageStructure;
  resources?: ResourcesStructure;
  custom?: any;
  functionsRule?: FunctionsRuleItem[];
}

export interface Builder {
  validate(): boolean;
  toJSON();
  getProvider(): ProviderStructure;
  getFunctions(): FunctionsStructure;
  getResources(): ResourcesStructure;
  getService(): ServiceStructure;
  getLayers(): LayersStructure;
  getCustom(): any;
  getPackage(): PackageStructure;
  getPlugins(): PluginsStructure;
  getAggregation(): AggregationStructure;
}
