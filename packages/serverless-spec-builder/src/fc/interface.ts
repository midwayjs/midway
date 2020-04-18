import {
  FunctionsStructure,
  FunctionStructure,
  ProviderStructure,
  SpecStructure,
} from '../interface';

export interface FCSpec {
  ROSTemplateFormatVersion: string;
  Transform?: string;
  Resources: {
    [resourceName: string]: FCServiceSpec | FCCustomDomainSpec | FCLogSpec;
  };
}

export type FCServiceType = 'Aliyun::Serverless::Service';
export type FCFunctionType = 'Aliyun::Serverless::Function';
export type FCCustomDomainType = 'Aliyun::Serverless::CustomDomain';
export type FCLogType = 'Aliyun::Serverless::Log';
export type FCLogStoreType = 'Aliyun::Serverless::Log::Logstore';

export interface FCProviderStructure extends ProviderStructure {
  vpcConfig?: {
    vpcId: string;
    vSwitchIds: string[];
    securityGroupId: string;
  };
  internetAccess?: boolean;
  policies?: string | string[];
  logConfig?: {
    project: string;
    logstore: string;
  };
  nasConfig?:
    | 'auto'
    | {
        userId: number;
        groupId: number;
        mountPoints: Array<{
          serverAddr: string;
          mountDir: string;
        }>;
      };
}

export interface FCSpecStructure extends SpecStructure {
  provider?: FCProviderStructure;
}

export interface FCServiceProperties {
  Role?: string;
  Policies?: string | string[];
  InternetAccess?: boolean;
  VpcConfig?: {
    VpcId: string;
    VSwitchIds: string[];
    SecurityGroupId: string;
  };
  LogConfig?: {
    Project: string;
    Logstore: string;
  };
  NasConfig?: {
    UserId: number;
    GroupId: number;
    MountPoints?: MountPointSpec[];
  };
  Description?: string;
}

export interface FCServiceSpec {
  [propertyName: string]: FCServiceType | FCFunctionSpec | FCServiceProperties;
}

export interface MountPointSpec {
  ServerAddr?: string;
  MountDir?: string;
}

export interface FCFunctionSpec {
  Type: FCFunctionType;
  Properties: {
    Handler: string;
    Runtime: string;
    CodeUri: string;
    Initializer?: string;
    Description?: string;
    MemorySize?: number;
    Timeout?: number;
    InitializationTimeout?: number;
    EnvironmentVariables?: object;
    InstanceConcurrency?: number;
  };
  Events?: {
    [eventName: string]:
      | FCHTTPEvent
      | FCTimerEvent
      | FCOSSEvent
      | FCLOGEvent
      | FCMNSTopicEvent
      | FCRDSEvent
      | FCTableStoreEvent;
  };
}

export type HTTPEventType = 'GET' | 'POST' | 'PUT' | 'DELETE' | 'HEAD';

export interface FCHTTPEvent {
  Type: 'HTTP';
  Properties: {
    AuthType?: 'ANONYMOUS' | 'FUNCTION';
    Methods?: HTTPEventType[];
    InvocationRole?: string;
    Qualifier?: string;
  };
}

export interface FCOSSEvent {
  Type: 'OSS';
  Properties: {
    BucketName: string;
    Events: string[];
    Filter: {
      Key: {
        Prefix: string;
        Suffix: string;
      };
    };
    Enable: boolean;
    InvocationRole?: string;
    Qualifier?: string;
  };
}

export interface FCLOGEvent {
  Type: 'Log';
  Properties: {
    SourceConfig: {
      Logstore: string;
    };
    JobConfig: {
      MaxRetryTime: number;
      TriggerInterval: number;
    };
    LogConfig: {
      Project: string;
      Logstore: string;
    };
    Enable: boolean;
    InvocationRole?: string;
    Qualifier?: string;
  };
}

export interface FCTimerEvent {
  Type: 'Timer';
  Properties: {
    CronExpression: string;
    Enable?: boolean;
    Payload?: string;
    InvocationRole?: string;
    Qualifier?: string;
  };
}

export interface FCMNSTopicEvent {
  Type: 'MNSTopic';
  Properties: {
    TopicName: string;
    Region?: string;
    NotifyContentFormat?: 'STREAM' | 'JSON';
    NotifyStrategy?: string | 'BACKOFF_RETRY' | 'EXPONENTIAL_DECAY_RETRY';
    FilterTag?: string;
    InvocationRole?: string;
    Qualifier?: string;
  };
}

export interface FCRDSEvent {
  Type: 'RDS';
  Properties: {
    InstanceId: string;
    SubscriptionObjects: string[];
    Retry?: string;
    Concurrency?: string;
    EventFormat?: 'json' | 'protobuf';
    InvocationRole?: string;
    Qualifier?: string;
  };
}

export interface FCTableStoreEvent {
  Type: 'TableStore';
  Properties: {
    InstanceName: string;
    TableName: string;
    InvocationRole?: string;
    Qualifier?: string;
  };
}

export interface FCCustomDomainSpec {
  Type: FCCustomDomainType;
  Properties: {
    Protocol?: string;
    RouteConfig?: {
      routes?: {
        [router: string]: {
          ServiceName: string;
          FunctionName: string;
        };
      };
    };
  };
}

export interface FCLogSpec {
  [propertyName: string]: FCLogType | FCLogStoreSpec | FCLogProperties;
}

export interface FCLogProperties {
  Description?: string;
}

export interface FCLogStoreSpec {
  [propertyName: string]: FCLogStoreType | FCLogStoreProperties;
}

export interface FCLogStoreProperties {
  TTL?: number;
  shardCount?: number;
}

export interface FCFunctionStructure extends FunctionStructure {
  codeUri?: string;
  initializer?: string;
}

export interface FCFunctionsStructure extends FunctionsStructure {
  [functionName: string]: FCFunctionStructure;
}
