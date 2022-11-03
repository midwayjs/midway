export function mockContext() {
  return {
    requestId: 'b1c5100f-819d-c421-3a5e-7782a27d8a33',
    credentials: {
      accessKeyId: 'STS.access_key_id',
      accessKeySecret: 'access_key_secret',
      securityToken: 'security_token',
    },
    function: {
      name: 'my-func',
      handler: 'index.handler',
      memory: 128,
      timeout: 10,
      initializer: 'index.initializer',
      initializationTimeout: 10,
    },
    service: {
      name: 'my-service',
      logProject: 'my-log-project',
      logStore: 'my-log-store',
      qualifier: 'qualifier',
      versionId: '1',
    },
    region: 'cn-shanghai',
    accountId: '123456',
    logger: console,
  };
}

export function mockCDNEvent() {
  return {
    events: [
      {
        eventName: 'LogFileCreated',
        eventSource: 'cdn',
        region: 'cn-hangzhou',
        eventVersion: '1.0.0',
        eventTime: 'xxxxx',
        userIdentity: {
          aliUid: '1xxxxxxxxxxxx',
        },
        resource: {
          domain: 'example.com',
        },
        eventParameter: {
          domain: 'example.com',
          endTime: 1000000,
          fileSize: 1788115,
          filePath:
            'http://cdnlog.cn-hangzhou.oss.aliyun-inc.com/xxx/xxx/xxx.gz?OSSAccessKeyId=xxxx&Expires=xxxx&Signature=xxxx',
          startTime: 11000000,
        },
        traceId: 'xxxxxx',
      },
    ],
  };
}

export function mockMNSEvent() {
  return {
    Context: 'user custom info',
    TopicOwner: '1186202104331798',
    Message: 'hello topic',
    Subscriber: '1186202104331798',
    PublishTime: 1550216302888,
    SubscriptionName: 'test-fc-subscibe',
    MessageMD5: 'BA4BA9B48AC81F0F9C66F6C909C39DBB',
    TopicName: 'test-topic',
    MessageId: '2F5B3C281B283D4EAC694B7425288675',
  };
}

export function mockOSSEvent() {
  return {
    events: [
      {
        eventName: 'ObjectCreated:PutObject',
        eventSource: 'acs:oss',
        eventTime: '2017-04-21T12:46:37.000Z',
        eventVersion: '1.0',
        oss: {
          bucket: {
            arn: 'acs:oss:cn-shanghai:123456789:bucketname',
            name: 'testbucket',
            ownerIdentity: '123456789',
            virtualBucket: '',
          },
          object: {
            deltaSize: 122539,
            eTag: '688A7BF4F233DC9C88A80BF985AB7329',
            key: 'image/a.jpg',
            size: 122539,
          },
          ossSchemaVersion: '1.0',
          ruleId: '9adac8e253828f4f7c0466d941fa3db81161e853',
        },
        region: 'cn-shanghai',
        requestParameters: {
          sourceIPAddress: '140.205.128.221',
        },
        responseElements: {
          requestId: '58F9FF2D3DF792092E12044C',
        },
        userIdentity: {
          principalId: '123456789',
        },
      },
    ],
  };
}

export function mockSLSEvent() {
  return {
    parameter: {},
    source: {
      endpoint: 'http://cn-shanghai-intranet.log.aliyuncs.com',
      projectName: 'log-com',
      logstoreName: 'log-en',
      shardId: 0,
      beginCursor: 'MTUyOTQ4MDIwOTY1NTk3ODQ2Mw==',
      endCursor: 'MTUyOTQ4MDIwOTY1NTk3ODQ2NA==',
    },
    jobName: '1f7043ced683de1a4e3d8d70b5a412843d817a39',
    taskId: 'c2691505-38da-4d1b-998a-f1d4bb8c9994',
    cursorTime: 1529486425,
  };
}

export function mockTableStoreEvent() {
  return {
    Version: 'string',
    Records: [
      {
        Type: 'string',
        Info: {
          Timestamp: Date.now(),
        },
        PrimaryKey: [
          {
            ColumnName: 'string',
            Value: 'new event',
          },
        ],
        Columns: [
          {
            Type: 'string',
            ColumnName: 'string',
            Value: 'new event',
            Timestamp: Date.now(),
          },
        ],
      },
    ],
  };
}

export function mockTimerEvent() {
  return {
    triggerTime: new Date().toJSON(),
    triggerName: 'timer',
    payload: '',
  };
}
