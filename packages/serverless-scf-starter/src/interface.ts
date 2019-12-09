export interface SCFContext {
  callbackWaitsForEmptyEventLoop: boolean;
  memory_limit_in_mb: number;
  time_limit_in_ms: number;
  request_id: string;
  environ: string;
  function_version: string;
  function_name: string;
  namespace: string;
}

// Ref: https://cloud.tencent.com/document/product/583/12513
export interface SCFHTTPEvent {
  /**
   * 请求来源的 API 网关的配置信息、请求标识、认证信息、来源信息。其中：
   * serviceId，path，httpMethod 指向 API 网关的服务Id、API 的路径和方法；
   * stage 指向请求来源 API 所在的环境；
   * requestId 标识当前这次请求的唯一 ID；
   * identity 标识用户的认证方法和认证的信息；
   * sourceIp 标识请求来源 IP
   */
  requestContext: {
    serviceId: string;
    path: string;
    httpMethod: string;
    requestId: string;
    identity: {
      secretId?: string;
    };
    sourceIp: string;
    stage: string;
  };
  // 记录实际请求的完整 Header 内容
  headers: { [key: string]: string };
  // 记录实际请求的完整 Body 内容
  body?: string;
  // 记录在 API 网关中配置过的 Query 参数以及实际取值
  queryStringParameters: { [key: string]: string };
  // 记录在 API 网关中配置过的 Path 参数以及实际取值
  pathParameters: { [key: string]: string };
  // 记录在 API 网关中配置过的 Header 参数以及实际取值
  headerParameters: { [key: string]: string };
  stageVariables: {
    stage: string;
  };
  // 记录实际请求的完整 Path 信息
  path: string;
  // 请求地址的查询参数
  queryString: { [key: string]: string };
  httpMethod: string;
}

// Ref: https://cloud.tencent.com/document/product/583/9708
export interface SCFTimerEvent {
  Message: string;
  Time: string;
  TriggerName: string;
  Type: string;
}

interface Records<T> {
  Records: T[];
}

export interface SCFCOSEvent extends Records<COSRecord> {}

export interface COSRecord {
  cos: {
    cosBucket: {
      appid: string;
      name: string;
      region: string;
    };
    cosNotificationId: string;
    cosObject: {
      key: string;
      meta: {
        'Content-Type': string;
        'x-cos-request-id': string;
      };
      size: number;
      url: string;
      vid: string;
    };
    cosSchemaVersion: string;
  };
  event: COSEvent;
}

export interface COSEvent {
  eventName: string;
  eventQueue: string;
  eventSource: string;
  eventTime: number;
  eventVersion: string;
  reqid: number;
  requestParameters: {
    requestHeaders: {
      Authorization: string;
    };
    requestSourceIP: string;
  };
  reservedInfo: string;
}

export interface SCFCMQEvent extends Records<CMQRecord> {}

export interface CMQRecord {
  CMQ: {
    type: string;
    topicOwner: number;
    topicName: string;
    subscriptionName: string;
    publishTime: string;
    msgId: string;
    requestId: string;
    msgBody: string;
    msgTag: string[];
  };
}

export interface CKafkaEvent extends Records<CKafkaRecord> {}

export interface CKafkaRecord {
  Ckafka: {
    topic: string;
    partition: number;
    offset: number;
    msgKey: string;
    msgBody: string;
  };
}
