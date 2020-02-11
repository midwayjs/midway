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
}

export interface FunctionsStructure {
  [functionName: string]: FunctionStructure;
}

export type EventTypeKey = 'http' | 'schedule' | 'os' | 'log';

export type EventType = HTTPEvent | ScheduleEvent | LogEvent | OSEvent;

export interface EventStructureType {
  [eventName: string]: EventType;
}

export interface HTTPEvent {
  path?: string;
  method?: string | string[];
}

// 定时任务
export interface ScheduleEvent {
  type: 'cron' | 'every' | 'interval';
  value: string;
  payload?: string;
}

// 日志
export interface LogEvent {
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
  bucket: string;
  events: string[];
  filterPrefix: string;
  filterSuffix: string;
  role?: string;
  version?: string;
}

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
}

export interface LayersStructure {
  [layerName: string]: {
    path: string;
    name?: string;
  };
}

export interface ResourcesStructure {}

export interface ServiceStructure {
  name?: string;
  description?: string;
}

export interface AggregationStructure {
  [aggregationName: string]: {
    deployOrigin?: boolean;
    functions: string[];
  };
}

export type PluginsStructure = string[];

export interface PackageStructure {
  artifact?: string;
  include?: string[];
  exclude?: string[];
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
