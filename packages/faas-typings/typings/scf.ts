interface COSRecord {
  cos: {
    cosSchemaVersion: string;
    cosObject: {
      url: string;
      meta: {
        'x-cos-request-id': string;
        'Content-Type': string;
      };
      vid: string;
      key: string;
      size: number;
    };
    cosBucket: {
      region: string;
      name: string;
      appid: string;
    };
    cosNotificationId: string;
  };
  event: {
    eventName: string;
    eventVersion: string;
    eventTime: number;
    eventSource: string;
    requestParameters: {
      requestSourceIP: string;
      requestHeaders: {
        Authorization: string;
      };
    };
    eventQueue: string;
    reservedInfo: string;
    reqid: number;
  };
}

interface CMQRecord {
  CMQ: {
    type: string;
    topicOwner: number;
    topicName: string;
    subscriptionName: string;
    publishTime: string;
    msgId: string;
    requestId: string;
    msgBody: string;
    msgTag: string;
  };
}

interface CKafkaRecord {
  Ckafka: {
    topic: string;
    partition: number;
    offset: number;
    msgKey: string;
    msgBody: string;
  };
}

// TODO: prevent namespace usage
// eslint-disable-next-line @typescript-eslint/no-namespace
export namespace SCF {
  export interface COSEvent {
    Records: COSRecord[];
  }

  export interface TimerEvent {
    Type: string;
    TriggerName: string;
    Time: string;
    Message: string;
  }

  export interface CMQEvent {
    Records: CMQRecord[];
  }

  export interface CKafkaEvent {
    Records: CKafkaRecord[];
  }

  export interface APIGatewayEvent {
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
        secretId: string;
      };
      sourceIp: string;
      stage: string;
    };
    /**
     * 记录实际请求的完整 Header 内容
     */
    headers: { [key: string]: string };
    /**
     * 记录实际请求的完整 Body 内容
     */
    body: string;
    /**
     * 记录在 API 网关中配置过的 Path 参数以及实际取值
     */
    pathParameters: {
      path: string;
    };
    /**
     * 记录在 API 网关中配置过的 Query 参数以及实际取值
     */
    queryStringParameters: {
      foo: string;
    };
    /**
     * 记录在 API 网关中配置过的 Header 参数以及实际取值
     */
    headerParameters: { [key: string]: string };
    stageVariables: {
      stage: string;
    };
    /**
     * 记录实际请求的完整 Path 信息，注意 midway faas 为了获取真实 path 做过处理
     */
    path: string;
    /**
     * 请求地址的查询参数
     */
    queryString: { [key: string]: string };
    httpMethod: string;
  }

  export interface APIGatewayResponse {
    isBase64Encoded: boolean;
    statusCode: number;
    headers: object;
    body: string;
  }

  export interface APIGatewayWebSocketEvent {
    requestContext: {
      serviceName: string;
      path: string;
      httpMethod: string;
      requestId: string;
      identity: {
        secretId: string;
      };
      sourceIp: string;
      stage: string;
      websocketEnable: boolean;
    };
    websocket: {
      action: string;
      secConnectionID: string;
      secWebSocketProtocol: string;
      secWebSocketExtensions: string;
    };
  }

  export interface APIGatewayWebSocketResponse {
    errNo: number;
    errMsg: string;
    websocket: {
      action: string;
      secConnectionID: string;
      secWebSocketProtocol: string;
      secWebSocketExtensions: string;
    };
  }

  export interface RequestContext {
    callbackWaitsForEmptyEventLoop: boolean;
    memory_limit_in_mb: number;
    time_limit_in_ms: number;
    request_id: string;
    environ: string;
    function_version: string;
    function_name: string;
    namespace: string;
  }
}
