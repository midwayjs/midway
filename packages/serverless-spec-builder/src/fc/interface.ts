import { FunctionsStructure, FunctionStructure } from '../interface';

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
  };
  Events?: {
    [eventName: string]: FCHTTPEvent | FCTimerEvent | FCOSSEvent | FCLOGEvent;
  };
}

export type HTTPEventType = 'GET' | 'POST' | 'PUT' | 'DELETE' | 'HEAD';

export interface FCHTTPEvent {
  Type: 'HTTP';
  Properties: {
    AuthType?: 'ANONYMOUS' | 'FUNCTION';
    Methods?: HTTPEventType[];
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
