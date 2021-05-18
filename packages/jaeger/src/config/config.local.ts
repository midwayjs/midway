import { TracerConfig } from '../lib/types';

export const tracer: TracerConfig = {
  whiteList: ['/favicon.ico', '/favicon.png'],
  reqThrottleMsForPriority: 10,
  middleWareName: 'tracerMiddleware',
  tracingConfig: {
    sampler: {
      type: 'probabilistic',
      param: 1,
    },
    reporter: {
      agentHost: '127.0.0.1',
    },
  },
};
