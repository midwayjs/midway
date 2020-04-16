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
    headers: {
      'Accept-Language': string;
      Accept: string;
      Host: string;
      'User-Agent': string;
    };
    body: string;
    pathParameters: {
      path: string;
    };
    queryStringParameters: {
      foo: string;
    };
    headerParameters: {
      Refer: string;
    };
    stageVariables: {
      stage: string;
    };
    path: string;
    queryString: {
      foo: string;
      bob: string;
    };
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
}
