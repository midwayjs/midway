import * as stream from 'stream';

/**
 * context
 */
export interface FCOriginContext {
  requestId: string;
  credentials: {
    accessKeyId: string;
    accessKeySecret: string;
    securityToken: string;
  };
  function: {
    name: string;
    handler: string;
    memory: number;
    timeout: number;
    initializer: string;
    initializationTimeout: number;
  };
  service: {
    name: string;
    logProject: string;
    logStore: string;
    qualifier: string;
    versionId: string;
  };
  region: string;
  accountId: string;
}

/**
 * HTTP Trigger
 */
export interface FCOriginHTTPRequest {
  headers: object;
  path: string;
  queries: object;
  method: string;
  clientIP: string;
  url: string;
}

export interface FCOriginHTTPResponse {
  setStatusCode(statusCode: number);

  setHeader(headerKey: string, headerValue: string);

  deleteHeader(headerKey: string);

  send(body: string | Buffer | stream.Readable);
}

/**
 * API Gateway
 */
export interface FCOriginApiGatewayEvent {
  path: string;
  httpMethod: string;
  headers: object;
  queryParameters: object;
  pathParameters: object;
  body: string;
  isBase64Encoded: 'false' | 'true';
}

export interface FCOriginApiGatewayResponse {
  isBase64Encoded: boolean;
  statusCode: number;
  headers: object;
  body: string;
}

/**
 * OSS
 */
export interface FCOriginInnerOSSEvent {
  eventName: string;
  eventSource: string;
  eventTime: string;
  eventVersion: string;
  oss: {
    bucket: {
      arn: string;
      name: string;
      ownerIdentity: string;
      virtualBucket: string;
    };
    object: {
      deltaSize: number;
      eTag: string;
      key: string;
      size: number;
    };
    ossSchemaVersion: string;
    ruleId: string;
  };
  region: string;
  requestParameters: {
    sourceIPAddress: string;
  };
  responseElements: {
    requestId: string;
  };
  userIdentity: {
    principalId: string;
  };
}

export interface FCOriginOSSEvent {
  events: FCOriginInnerOSSEvent[];
}

/**
 * Timer
 */
export interface FCOriginTimerEvent {
  triggerTime: string;
  triggerName: string;
  payload: any;
}

/**
 * SLS
 */
export interface FCOriginSLSEvent {
  parameter: object;
  source: {
    endpoint: string;
    projectName: string;
    logstoreName: string;
    shardId: number;
    beginCursor: string;
    endCursor: string;
  };
  jobName: string;
  taskId: string;
  cursorTime: number;
}

/**
 * CDN
 */
export type FCOriginInnerCDNEvent =
  | FCOriginInnerCDNCachedObjectsRefreshedEvent
  | FCOriginInnerCDNCachedObjectsPushedEvent
  | FCOriginInnerCDNCachedObjectsBlockedEvent
  | FCOriginInnerCDNLogFileCreatedEvent;

export interface FCOriginInnerCDNBaseEvent {
  eventName: string; // 事件类型
  eventVersion: string; // 事件版本，目前都是1.0.0版本
  eventSource: string; // 事件源名称
  region: string; // 区域，默认为"cn-hangzhou"
  eventTime: string; // 事件发生时间
  traceId: string; // 事件源传递过来的id, 用于排查问题
  resource: {
    domain: string; // 资源所在的域名
  };
  userIdentity: {
    aliUid: string; // 用户ID
  };
}

export interface FCOriginInnerCDNCachedObjectsRefreshedEvent
  extends FCOriginInnerCDNBaseEvent {
  eventParameter: {
    objectPath: string[];
    createTime: number; // 刷新开始时间
    domain: string; // 资源所在的域名
    completeTime: number; // 刷新结束时间
    objectType: string; // 刷新类型，取值为File，Directory
    taskId: number; // 资源刷新任务ID
  };
}

export type FCOriginInnerCDNCachedObjectsPushedEvent = FCOriginInnerCDNCachedObjectsRefreshedEvent;

export type FCOriginInnerCDNCachedObjectsBlockedEvent = FCOriginInnerCDNCachedObjectsRefreshedEvent;

export interface FCOriginInnerCDNLogFileCreatedEvent
  extends FCOriginInnerCDNBaseEvent {
  eventParameter: {
    domain: number; // 域名
    endTime: number; // 日志文件的结束时间
    fileSize: number; // 日志文件大小
    filePath: number; // 日志文件地址
    startTime: number; // 日志文件的起始时间
  };
}

export interface FCOriginCDNEvent {
  events: FCOriginInnerCDNEvent[];
}
