import { invoke as InvokeFun } from './main';
import { InvokeOptions } from './interface';

export const defualtProviderEventMap = {
  fc: {
    starter: require.resolve('@midwayjs/serverless-fc-starter'),
    eventPath: require.resolve('@midwayjs/serverless-fc-trigger'),
    eventName: {
      http: 'HTTPTrigger',
      apiGateway: 'ApiGatewayTrigger',
    },
  },
  scf: {
    starter: require.resolve('@midwayjs/serverless-scf-starter'),
  },
};

export const invoke = (options: InvokeOptions) => {
  const { provider, trigger } = options;
  const providerEventMap = options.providerEventMap || defualtProviderEventMap;
  const runtimeMap = providerEventMap[provider] || {};

  const starter = runtimeMap.starter;
  const eventPath = runtimeMap.eventPath;
  const eventName = runtimeMap.eventName && runtimeMap.eventName[trigger];

  return InvokeFun({
    ...options,
    starter,
    eventPath,
    eventName,
  });
};
