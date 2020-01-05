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

export type EventType = 'http' | 'hsf' | 'mq' | 'mtop' | 'schedule';

export interface EventStructureType {
  [eventName: string]: HTTPEvent | HSFEvent | MQEvent;
}

export interface HTTPEvent {
  path?: string;
  method?: string | string [];
}

export interface HSFEvent {
  hsf?: {
    interfaceName?: string;
    version?: string;
    group?: string;
  };
}

export interface MQEvent {
  group?: string;
  topic?: string;
  tags?: string;
  tag?: string;
}

export interface ScheduleEvent {
  type: 'cron' | 'every' | 'interval';
  value: string;
  payload?: string;
}

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
export interface OsEvent {
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
  scale?: ScaleStructure;
}

export interface ScaleStructure {
  concurrency?: number;
  min?: number;
  max?: number;
}

export interface LayersStructure {
  [layerName: string]: {
    path: string;
    name?: string;
  };
}

export interface ResourcesStructure {
}

export type ServiceStructure = string | {
  name?: string;
  description?: string;
};

export interface SpecStructure {
  service?: ServiceStructure;
  provider?: ProviderStructure;
  functions?: FunctionsStructure;
  layers?: LayersStructure;
  resources?: ResourcesStructure;
}

export interface Builder {
  validate();
  getProvider(): ProviderStructure;
  getFunctions(): FunctionsStructure;
  getResources(): ResourcesStructure;
  getService(): ServiceStructure;
  getLayers(): LayersStructure;
  toJSON();
}
