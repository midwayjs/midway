import { TracerConfig } from '../lib/types';

export const tracer: TracerConfig = {
  whiteList: ['/favicon.ico', '/favicon.png'],
  reqThrottleMsForPriority: 150,
  enableMiddleWare: true,
  enableCatchError: true,
  isLogginInputQuery: false,
  isLoggingOutputBody: false,
  tracingConfig: {
    sampler: {
      type: 'probabilistic',
      param: 0.0001,
    },
    reporter: {
      agentHost: '127.0.0.1',
    },
  },
};
