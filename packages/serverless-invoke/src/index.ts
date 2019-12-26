import { invoke as InvokeFun } from '@midwayjs/faas-local';

export const runtimeEventMap = {
  aliyun: {
    starter: require.resolve('@midwayjs/serverless-fc-starter'),
    eventPath: require.resolve('@midwayjs/serverless-fc-trigger'),
    eventName: {
      http: 'HTTPTrigger',
      apiGateway: 'ApiGatewayTrigger'
    },
  },
  tencent: {
    starter: require.resolve('@midwayjs/serverless-scf-starter')
  }
};

export const invoke = (options: {
  functionDir?: string; // 函数所在目录
  functionName: string; // 函数名
  debug?: string;       // debug 端口
  data?: any[];         // 函数入参
  nolog?: boolean;      // 是否不进行console输出
  trigger?: string;     // 触发器
  runtime?: string;     // 运行时环境
}) => {
  const { runtime, trigger } = options;
  const runtimeMap = runtimeEventMap[runtime] || {};

  const starter = runtimeMap.starter;
  const eventPath = runtimeMap.eventPath;
  const eventName = runtimeMap.eventName && runtimeMap.eventName[trigger];

  return InvokeFun({
    ...options,
    starter,
    eventPath,
    eventName
  });
};
